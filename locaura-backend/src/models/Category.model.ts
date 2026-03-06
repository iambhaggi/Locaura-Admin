import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    parent_id?: mongoose.Types.ObjectId;
    image?: string;
}

const CategorySchema: Schema = new Schema({
    _id: mongoose.Types.ObjectId,
    name: { type: String, required: true, trim: true },
    description: { type: String },
    parent_id: { type: mongoose.Types.ObjectId, ref: 'Category' },
    image: { type: String }
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);