import { Payout, IPayout } from '../models/Payout.model';
import { PayoutStatus } from '../enums/retailer.enum';

export class PayoutRepository {
    async create(payout_data: Partial<IPayout>): Promise<IPayout> {
        const payout = new Payout(payout_data);
        return payout.save();
    }

    async find_by_id(payout_id: string): Promise<IPayout | null> {
        return Payout.findById(payout_id)
            .populate('retailer_id')
            .populate('store_id');
    }

    async find_by_store(store_id: string): Promise<IPayout[]> {
        return Payout.find({ store_id })
            .sort({ 'period.to': -1 })
            .populate('retailer_id');
    }

    async find_by_retailer(retailer_id: string): Promise<IPayout[]> {
        return Payout.find({ retailer_id })
            .sort({ 'period.to': -1 })
            .populate('store_id');
    }

    async find_by_status(status: PayoutStatus): Promise<IPayout[]> {
        return Payout.find({ status })
            .sort({ 'period.to': -1 });
    }

    async find_pending_for_retailer(retailer_id: string): Promise<IPayout[]> {
        return Payout.find({
            retailer_id,
            status: { $in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING] }
        }).sort({ 'period.to': -1 });
    }

    async find_period_payout(
        store_id: string,
        from: Date,
        to: Date
    ): Promise<IPayout | null> {
        return Payout.findOne({
            store_id,
            'period.from': { $lte: from },
            'period.to': { $gte: to }
        });
    }

    async update(payout_id: string, update_data: Partial<IPayout>): Promise<IPayout | null> {
        return Payout.findByIdAndUpdate(
            payout_id,
            update_data,
            { new: true }
        ).populate('retailer_id')
         .populate('store_id');
    }

    async update_status(payout_id: string, status: PayoutStatus): Promise<IPayout | null> {
        return Payout.findByIdAndUpdate(
            payout_id,
            { status },
            { new: true }
        ).populate('retailer_id')
         .populate('store_id');
    }

    async update_with_reference(
        payout_id: string,
        payout_reference: string,
        paid_at: Date
    ): Promise<IPayout | null> {
        return Payout.findByIdAndUpdate(
            payout_id,
            {
                payout_reference,
                paid_at,
                status: PayoutStatus.PAID
            },
            { new: true }
        ).populate('retailer_id')
         .populate('store_id');
    }
}
