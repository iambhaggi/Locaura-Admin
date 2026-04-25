const mongoose = require('mongoose');
const { connectAppMongoDB } = require('../config/database');

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image: { type: String }
  },
  { timestamps: true }
);

const createCategoryModel = async () => {
  const appConnection = await connectAppMongoDB();
  return appConnection.model('Category', CategorySchema);
};

module.exports = { createCategoryModel, CategorySchema };