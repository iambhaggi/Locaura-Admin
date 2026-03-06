import { Schema } from 'mongoose';

export interface IAddress {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    neighborhood: string;
}

export interface ILocation {
    type: "Point";
    coordinates: [number, number]; // [Longitude, Latitude]
}

export const AddressSchema = new Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    neighborhood: { type: String }
}, { _id: false });

export const LocationSchema = new Schema({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [long, lat]
}, { _id: false });
