const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },

    stockQuantity: { type: Number, required: true, default: 0, min: 0 },

    description: { type: String, required: true },
    benefits: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    nutritionFacts: { type: String, default: '' },
    servingSize: { type: String, default: '' },
    usageInstructions: { type: String, default: '' },
    warnings: { type: String, default: '' },
    suitableFor: { type: String, default: '' },

    tags: { type: [String], default: [] },

    thumbnail: { type: String, default: '' },
    gallery: { type: [String], default: [] },

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },

    status: { type: String, enum: ['Published', 'Hidden', 'Draft'], default: 'Draft' },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    salesCount: { type: Number, default: 0 }, // incremented when orders complete, powers "Best Selling"
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', tags: 'text', description: 'text' });

// Virtual: discounted price
productSchema.virtual('finalPrice').get(function () {
  if (!this.discountPercent) return this.price;
  return Math.round(this.price * (1 - this.discountPercent / 100) * 100) / 100;
});

productSchema.virtual('inStock').get(function () {
  return this.stockQuantity > 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
