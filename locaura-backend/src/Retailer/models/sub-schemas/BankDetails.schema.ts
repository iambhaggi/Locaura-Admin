import { Schema } from 'mongoose';

export interface IBankDetails {
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
}

export const BankDetailsSchema = new Schema({
    account_number: { type: String },
    ifsc_code: { type: String },
    account_holder_name: { type: String }
}, { _id: false });
