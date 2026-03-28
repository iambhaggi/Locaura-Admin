import { PayoutRepository } from '../repositories/PayoutRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { RetailerRepository } from '../repositories/RetailerRepository';
import { IPayout } from '../models/Payout.model';
import { PayoutStatus } from '../enums/retailer.enum';
import { OrderStatus, PaymentStatus } from '../enums/order.enum';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'fallbackKeyId',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallbackSecret'
});

const PLATFORM_FEE_PERCENTAGE = 18; // 18% platform fee
const PAYOUT_HOLD_DAYS = 2; // Hold payouts for 2 days to allow refunds

export class RetailerPayoutService {
    private payout_repo = new PayoutRepository();
    private order_repo = new OrderRepository();
    private store_repo = new StoreRepository();
    private retailer_repo = new RetailerRepository();

    /**
     * Calculate revenue for orders delivered between dates
     * Deducts platform fee and refunded amounts
     */
    async calculate_period_earnings(
        store_id: string,
        from_date: Date,
        to_date: Date
    ): Promise<{ total_revenue: number; total_orders: number; platform_fee: number; net_payout: number }> {
        const delivered_orders = await this.order_repo.find_by_store(store_id);
        
        let total_revenue = 0;
        let total_orders = 0;
        let refunded_amount = 0;

        // Filter for delivered, paid orders in date range
        for (const order of delivered_orders) {
            if (
                order.status === OrderStatus.DELIVERED &&
                order.createdAt >= from_date &&
                order.createdAt <= to_date
            ) {
                if (order.payment?.status === PaymentStatus.COMPLETED) {
                    total_revenue += order.pricing.total;
                    total_orders += 1;
                } else if (order.payment?.status === PaymentStatus.REFUNDED) {
                    // It was delivered but later refunded (partially or fully).
                    // In a simple model, we just count the full amount as refunded.
                    // If we assume revenue was never collected if refunded, we could just ignore,
                    // but depending on logic, maybe it was processed earlier and now refunded.
                    // Adjust as needed:
                    total_orders += 1;
                    refunded_amount += order.pricing.total;
                }
            }
        }

        const revenue_after_refunds = total_revenue - refunded_amount;
        const platform_fee = Math.round(revenue_after_refunds * (PLATFORM_FEE_PERCENTAGE / 100));
        const net_payout = revenue_after_refunds - platform_fee;

        return {
            total_revenue: revenue_after_refunds,
            total_orders,
            platform_fee,
            net_payout: Math.max(0, net_payout) // No negative payouts
        };
    }

    /**
     * Generate weekly payout batch for a store
     * Creates a Payout record with PENDING status
     */
    async generate_weekly_payout(store_id: string, to_date?: Date): Promise<IPayout> {
        const store = await this.store_repo.find_by_store_id(store_id);
        if (!store) {
            throw new Error(`Store not found: ${store_id}`);
        }

        const today = to_date || new Date();
        const from_date = new Date(today);
        from_date.setDate(from_date.getDate() - 7);

        // Check if payout already exists for this period
        const existing_payout = await this.payout_repo.find_period_payout(store_id, from_date, today);
        if (existing_payout && existing_payout.status !== PayoutStatus.PENDING) {
            throw new Error('Payout already exists for this period');
        }

        const earnings = await this.calculate_period_earnings(store_id, from_date, today);

        const payout_data: Partial<IPayout> = {
            retailer_id: store.retailer_id,
            store_id: new Object(store_id) as any, // Cast string to ObjectId internally handled
            period: {
                from: from_date,
                to: today
            },
            total_orders: earnings.total_orders,
            total_revenue: earnings.total_revenue,
            platform_fee: earnings.platform_fee,
            net_payout: earnings.net_payout,
            status: PayoutStatus.PENDING
        };

        return this.payout_repo.create(payout_data);
    }

    /**
     * Process a pending payout via Razorpay
     * Checks bank details exist and initiates payout
     */
    async process_payout(payout_id: string): Promise<IPayout> {
        const payout = await this.payout_repo.find_by_id(payout_id);
        if (!payout) {
            throw new Error(`Payout not found: ${payout_id}`);
        }

        if (payout.status !== PayoutStatus.PENDING) {
            throw new Error(`Payout cannot be processed with status: ${payout.status}`);
        }

        // Check hold window (must be 2+ days old)
        const payout_age_hours = (Date.now() - payout.createdAt.getTime()) / (1000 * 60 * 60);
        if (payout_age_hours < PAYOUT_HOLD_DAYS * 24) {
            throw new Error(`Payout must be at least ${PAYOUT_HOLD_DAYS} days old before processing`);
        }

        // Verify bank details exist
        const store = await this.store_repo.find_by_store_id(payout.store_id.toString());
        if (!store?.bank_details || !store.bank_details.account_holder_name) {
            throw new Error('Store bank details not configured');
        }

        try {
            // Call Razorpay payout API
            const rp = razorpay as any;
            const razorpay_payout = await rp.payouts.create({
                account_number: store.bank_details.account_number!,
                amount: Math.round(payout.net_payout * 100), // in paise
                currency: 'INR',
                mode: 'NEFT',
                purpose: 'payout',
                reference_id: payout._id.toString(),
                queue_if_low_balance: false // Fail if insufficient balance
            } as any);

            // Update payout with Razorpay reference
            await this.payout_repo.update_with_reference(
                payout_id,
                razorpay_payout.id,
                new Date()
            );

            // Change status to PROCESSING
            return await this.payout_repo.update_status(
                payout_id,
                PayoutStatus.PROCESSING
            ) as IPayout;
        } catch (error: any) {
            // Log error and update status to FAILED
            console.error(`Payout processing failed: ${error.message}`);
            await this.payout_repo.update_status(payout_id, PayoutStatus.FAILED);
            throw error;
        }
    }

    /**
     * Handle Razorpay payout.completed webhook event
     */
    async handle_payout_completed(entity: any): Promise<void> {
        const payout = await this.payout_repo.find_by_id(entity.reference_id);
        if (!payout) return;

        await this.payout_repo.update_status(
            entity.reference_id,
            PayoutStatus.PAID
        );
    }

    /**
     * Handle Razorpay payout.failed webhook event
     */
    async handle_payout_failed(entity: any): Promise<void> {
        const payout = await this.payout_repo.find_by_id(entity.reference_id);
        if (!payout) return;

        await this.payout_repo.update_status(
            entity.reference_id,
            PayoutStatus.FAILED
        );
    }

    /**
     * Get pending payouts for a retailer
     */
    async get_pending_payouts(retailer_id: string): Promise<IPayout[]> {
        return this.payout_repo.find_pending_for_retailer(retailer_id);
    }

    /**
     * Get payout by ID
     */
    async get_payout_by_id(payout_id: string): Promise<IPayout | null> {
        return this.payout_repo.find_by_id(payout_id);
    }

    /**
     * List all payouts for a retailer
     */
    async list_retailer_payouts(retailer_id: string, limit: number = 20): Promise<IPayout[]> {
        const payouts = await this.payout_repo.find_by_retailer(retailer_id);
        return payouts.slice(0, limit);
    }

    /**
     * List all payouts for a store
     */
    async list_store_payouts(store_id: string, limit: number = 20): Promise<IPayout[]> {
        const payouts = await this.payout_repo.find_by_store(store_id);
        return payouts.slice(0, limit);
    }
}
