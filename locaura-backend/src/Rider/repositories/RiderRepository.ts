import { Rider } from '../models/Rider.model';

export class RiderRepository {
    async find_by_phone(phone: string) {
        return Rider.findOne({ phone });
    }

    async find_by_id(rider_id: string) {
        return Rider.findById(rider_id);
    }
    
    async create(riderData: Partial<any>) {
        const new_rider = new Rider(riderData);
        return await new_rider.save();
    }

    async update(id: string, updateData: Partial<any>) {
        return await Rider.findByIdAndUpdate(id, updateData, { new: true });
    }

    async set_online_status(rider_id: string, isOnline: boolean) {
        // If they go offline, they are also not available. If online, they are available.
        return Rider.findByIdAndUpdate(rider_id, { 
            isOnline, 
            isAvailable: isOnline,
            lastActiveAt: new Date()
        }, { new: true });
    }

    async update_location(rider_id: string, lng: number, lat: number) {
        return Rider.findByIdAndUpdate(rider_id, {
            currentLocation: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            lastActiveAt: new Date()
        }, { new: true });
    }
}
