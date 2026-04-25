import { RiderRepository } from '../repositories/RiderRepository';
import { RiderEarning } from '../models/RiderEarning.model';
import { IRiderPayout } from '../models/RiderPayout.model';
import { RiderPayoutRepository } from '../repositories/RiderPayoutRepository';
import { get_razorpay_gateway } from '../../utils/RazorpayGatewayService';
import mongoose from 'mongoose';

const RIDER_PAYOUT_HOLD_DAYS = 2;

export class RiderPayoutService {
    private rider_repo = new RiderRepository();
    private rider_payout_repo = new RiderPayoutRepository();
    private razorpay_gateway = get_razorpay_gateway();

    async calculate_period_earnings(rider_id: string, from_date: Date, to_date: Date): Promise<{ total_deliveries: number; total_earnings: number }> {
        const earnings = await RiderEarning.find({
            rider_id: new mongoose.Types.ObjectId(rider_id),
            status: 'pending',
            createdAt: { $gte: from_date, $lte: to_date }
        });

        const total_deliveries = earnings.length;
        const total_earnings = earnings.reduce((sum, item) => sum + item.delivery_fee_earned + (item.bonus || 0), 0);

        return { total_deliveries, total_earnings };
    }

    async generate_weekly_payout(rider_id: string, to_date?: Date): Promise<IRiderPayout> {
        const rider = await this.rider_repo.find_by_id(rider_id);
        if (!rider) {
            throw new Error('Rider not found');
        }

        const today = to_date || new Date();
        const from_date = new Date(today);
        from_date.setDate(from_date.getDate() - 7);

        const existing = await this.rider_payout_repo.find_period_payout(rider_id, from_date, today);
        if (existing && existing.status !== 'pending') {
            throw new Error('Payout already exists for this period');
        }

        const earnings = await this.calculate_period_earnings(rider_id, from_date, today);
        if (earnings.total_earnings <= 0) {
            throw new Error('No pending rider earnings found for payout period');
        }

        return this.rider_payout_repo.create({
            rider_id: new mongoose.Types.ObjectId(rider_id),
            period: {
                from: from_date,
                to: today
            },
            total_deliveries: earnings.total_deliveries,
            total_earnings: earnings.total_earnings,
            status: 'pending'
        });
    }

    async process_payout(payout_id: string, rider_id: string): Promise<IRiderPayout> {
        const payout = await this.rider_payout_repo.find_by_id(payout_id);
        if (!payout) {
            throw new Error('Payout not found');
        }

        if (payout.rider_id.toString() !== rider_id) {
            throw new Error('Unauthorized payout access');
        }

        if (payout.status !== 'pending') {
            throw new Error(`Payout cannot be processed with status: ${payout.status}`);
        }

        const payout_age_hours = (Date.now() - payout.createdAt.getTime()) / (1000 * 60 * 60);
        if (payout_age_hours < RIDER_PAYOUT_HOLD_DAYS * 24) {
            throw new Error(`Payout must be at least ${RIDER_PAYOUT_HOLD_DAYS} days old before processing`);
        }

        const rider = await this.rider_repo.find_by_id(rider_id);
        if (!rider) {
            throw new Error('Rider not found');
        }

        if (!rider.upi_id && (!rider.bank_account_number || !rider.ifsc_code)) {
            throw new Error('Rider payout account details are incomplete. Add UPI or bank details.');
        }

        try {
            const amount_in_paise = Math.round(payout.total_earnings * 100);
            const reference_id = payout._id.toString();

            const payout_response = rider.upi_id
                ? await this.razorpay_gateway.create_vpa_payout({
                    amount_in_paise,
                    reference_id,
                    vpa: rider.upi_id,
                    beneficiary_name: rider.name,
                    narration: `Rider payout ${reference_id}`,
                    notes: {
                        beneficiary_type: 'rider',
                        rider_id
                    }
                })
                : await this.razorpay_gateway.create_bank_payout({
                    amount_in_paise,
                    reference_id,
                    account_number: rider.bank_account_number as string,
                    ifsc: rider.ifsc_code as string,
                    account_holder_name: rider.name,
                    narration: `Rider payout ${reference_id}`,
                    notes: {
                        beneficiary_type: 'rider',
                        rider_id
                    }
                });

            const updated = await this.rider_payout_repo.update(payout_id, {
                payout_reference: payout_response.id,
                status: 'processing'
            });

            if (!updated) {
                throw new Error('Failed to update rider payout status');
            }

            return updated;
        } catch (error: any) {
            await this.rider_payout_repo.update_status(payout_id, 'failed');
            throw new Error(`Rider payout processing failed: ${error.message}`);
        }
    }

    async handle_webhook_event(event: string, payload: any): Promise<void> {
        const entity = payload?.payout?.entity;
        if (!entity) {
            return;
        }

        switch (event) {
            case 'payout.processed':
            case 'payout.completed':
                await this.handle_payout_completed(entity);
                return;
            case 'payout.failed':
            case 'payout.rejected':
                await this.handle_payout_failed(entity);
                return;
            default:
                return;
        }
    }

    private async mark_earnings_settled(payout: IRiderPayout): Promise<void> {
        await RiderEarning.updateMany(
            {
                rider_id: payout.rider_id,
                status: 'pending',
                createdAt: { $gte: payout.period.from, $lte: payout.period.to }
            },
            {
                $set: {
                    status: 'settled',
                    settled_at: new Date()
                }
            }
        );
    }

    async handle_payout_completed(entity: any): Promise<void> {
        const payout_id = entity?.reference_id;
        if (!payout_id) {
            return;
        }

        const payout = await this.rider_payout_repo.update(payout_id, {
            status: 'paid',
            paid_at: new Date()
        });

        if (!payout) {
            return;
        }

        await this.mark_earnings_settled(payout);
    }

    async handle_payout_failed(entity: any): Promise<void> {
        const payout_id = entity?.reference_id;
        if (!payout_id) {
            return;
        }

        await this.rider_payout_repo.update_status(payout_id, 'failed');
    }

    async list_rider_payouts(rider_id: string, limit: number = 20): Promise<IRiderPayout[]> {
        const payouts = await this.rider_payout_repo.find_by_rider(rider_id);
        return payouts.slice(0, limit);
    }

    async get_pending_payouts(rider_id: string): Promise<IRiderPayout[]> {
        return this.rider_payout_repo.find_pending_for_rider(rider_id);
    }

    async get_payout_by_id(payout_id: string): Promise<IRiderPayout | null> {
        return this.rider_payout_repo.find_by_id(payout_id);
    }
}