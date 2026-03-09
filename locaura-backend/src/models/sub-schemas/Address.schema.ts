import { Schema } from 'mongoose';

export interface IAddress {
    shop_number?: string; // e.g., Shop 4A, First Floor
    building_name?: string; // e.g., Ritiik Mall
    street: string; 
    city: string;
    state: string;
    zip_code: string;
    landmark?: string; // e.g., Next to Metro Station
}

export const AddressSchema = new Schema({
    shop_number: { type: String },
    building_name: { type: String },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    landmark: { type: String }
}, { _id: false });


export interface ILocation {
    type: "Point";
    coordinates?: [number, number]; // [Longitude, Latitude]
}


export const LocationSchema = new Schema({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [long, lat]
}, { _id: false });
