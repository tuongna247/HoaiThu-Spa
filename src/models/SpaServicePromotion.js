const mongoose = require('mongoose');

const SpaServicePromotionSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpaService',
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpaPromotion',
    required: true
  },
  promotionName: {
    type: String,
    required: true,
    trim: true
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Price after applying promotion discount'
  },
  timesIncluded: {
    type: Number,
    required: true,
    min: 1,
    comment: 'Number of times customer can use this service'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
SpaServicePromotionSchema.index({ serviceId: 1, promotionId: 1 });
SpaServicePromotionSchema.index({ serviceId: 1 });
SpaServicePromotionSchema.index({ promotionId: 1 });
SpaServicePromotionSchema.index({ isActive: 1 });

// Compound index to prevent duplicates
SpaServicePromotionSchema.index(
  { serviceId: 1, promotionId: 1 },
  { unique: true }
);

module.exports = mongoose.models.SpaServicePromotion || mongoose.model('SpaServicePromotion', SpaServicePromotionSchema);
