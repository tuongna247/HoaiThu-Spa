const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String // Icon name or URL
  },
  color: {
    type: String,
    default: '#007bff' // Hex color code
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  display_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ is_active: 1, display_order: 1 });

// Helper method to get category hierarchy
CategorySchema.statics.getHierarchy = async function() {
  return await this.find({ parent_id: null, is_active: true })
    .populate({
      path: 'subcategories',
      match: { is_active: true },
      options: { sort: { display_order: 1 } }
    })
    .sort({ display_order: 1 })
    .exec();
};

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);