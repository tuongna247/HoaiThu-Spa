const mongoose = require('mongoose');

const SpaServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['massage', 'facial', 'body_treatment', 'nail_care', 'hair_care', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
SpaServiceSchema.index({ name: 1 });
SpaServiceSchema.index({ isActive: 1 });
SpaServiceSchema.index({ category: 1 });

module.exports = mongoose.models.SpaService || mongoose.model('SpaService', SpaServiceSchema);
