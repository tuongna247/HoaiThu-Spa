const mongoose = require('mongoose');

const SpaCustomerPurchaseSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpaCustomer',
    required: true
  },
  servicePromotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpaServicePromotion',
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'other'],
    default: 'cash'
  },
  totalTimesIncluded: {
    type: Number,
    required: true,
    min: 1,
    comment: 'Total number of service uses purchased'
  },
  timesUsed: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Number of times service has been used'
  },
  timesRemaining: {
    type: Number,
    required: true,
    comment: 'Remaining service uses'
  },
  expiryDate: {
    type: Date,
    default: null,
    comment: 'Optional expiry date for the purchased package'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
SpaCustomerPurchaseSchema.index({ customerId: 1 });
SpaCustomerPurchaseSchema.index({ servicePromotionId: 1 });
SpaCustomerPurchaseSchema.index({ paymentDate: -1 });
SpaCustomerPurchaseSchema.index({ status: 1 });
SpaCustomerPurchaseSchema.index({ customerId: 1, status: 1 });

// Pre-save hook to calculate remaining times
SpaCustomerPurchaseSchema.pre('save', function(next) {
  this.timesRemaining = this.totalTimesIncluded - this.timesUsed;

  // Update status based on usage
  if (this.timesRemaining <= 0) {
    this.status = 'completed';
  } else if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  }

  next();
});

module.exports = mongoose.models.SpaCustomerPurchase || mongoose.model('SpaCustomerPurchase', SpaCustomerPurchaseSchema);
