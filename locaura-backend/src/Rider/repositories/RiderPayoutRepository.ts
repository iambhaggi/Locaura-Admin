import { RiderPayout, IRiderPayout, RiderPayoutStatus } from '../models/RiderPayout.model';

export class RiderPayoutRepository {
    async create(data: Partial<IRiderPayout>): Promise<IRiderPayout> {
        const payout = new RiderPayout(data);
        return payout.save();
    }

    async find_by_id(payout_id: string): Promise<IRiderPayout | null> {
        return RiderPayout.findById(payout_id).populate('rider_id');
    }

    async find_by_rider(rider_id: string): Promise<IRiderPayout[]> {
        return RiderPayout.find({ rider_id }).sort({ 'period.to': -1 });
    }

    async find_pending_for_rider(rider_id: string): Promise<IRiderPayout[]> {
        return RiderPayout.find({
            rider_id,
            status: { $in: ['pending', 'processing'] }
        }).sort({ 'period.to': -1 });
    }

    async find_period_payout(rider_id: string, from: Date, to: Date): Promise<IRiderPayout | null> {
        return RiderPayout.findOne({
            rider_id,
            'period.from': { $lte: from },
            'period.to': { $gte: to }
        });
    }

    async update(payout_id: string, update_data: Partial<IRiderPayout>): Promise<IRiderPayout | null> {
        return RiderPayout.findByIdAndUpdate(payout_id, update_data, { new: true }).populate('rider_id');
    }

    async update_status(payout_id: string, status: RiderPayoutStatus): Promise<IRiderPayout | null> {
        return RiderPayout.findByIdAndUpdate(payout_id, { status }, { new: true }).populate('rider_id');
    }
}