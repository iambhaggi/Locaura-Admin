import { Schema } from 'mongoose';

export interface IBusinessHour {
    day: string;
    open: string;
    close: string;
    is_closed: boolean;
}

export const BusinessHourSchema = new Schema({
    day: { type: String },
    open: { type: String },
    close: { type: String },
    is_closed: { type: Boolean, default: false }
}, { _id: false });
