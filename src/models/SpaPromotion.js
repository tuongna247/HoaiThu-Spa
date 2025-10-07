const mongoose = require('mongoose');

const SpaPromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  reduceTimes: {
    type: Number,
    required: true,
    min: 1,
    comment: 'Number of service uses included in this promotion package'
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    comment: 'Percentage discount off base price'
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Fixed amount discount'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null  // null means no expiry
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
SpaPromotionSchema.index({ name: 1 });
SpaPromotionSchema.index({ isActive: 1 });
SpaPromotionSchema.index({ startDate: 1, endDate: 1 });

// Check if promotion is currently valid
SpaPromotionSchema.methods.isValid = function() {
  if (!this.isActive) return false;

  const now = new Date();
  if (this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;

  return true;
};

module.exports = mongoose.models.SpaPromotion || mongoose.model('SpaPromotion', SpaPromotionSchema);
