import { Schema } from 'mongoose';

export interface ISocialLinks {
    instagram?: string;
    whatsapp?: string;
}

export const SocialLinksSchema = new Schema({
    instagram: { type: String },
    whatsapp: { type: String }
}, { _id: false });
