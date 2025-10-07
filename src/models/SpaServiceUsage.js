const mongoose = require('mongoose');

const SpaServiceUsageSchema = new mongoose.Schema({
  customerPurchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpaCustomerPurchase',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpaCustomer',
    required: true
  },
  usingDateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  remainingAfterUse: {
    type: Number,
    required: true,
    min: 0,
    comment: 'How many times remaining after this use'
  },
  staffMember: {
    type: String,
    trim: true,
    maxlength: 100,
    comment: 'Staff member who provided the service'
  },
  note: {
    type: String,
    maxlength: 500,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
    comment: 'Customer satisfaction rating'
  },
  feedbackComments: {
    type: String,
    maxlength: 1000,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
SpaServiceUsageSchema.index({ customerPurchaseId: 1 });
SpaServiceUsageSchema.index({ customerId: 1 });
SpaServiceUsageSchema.index({ usingDateTime: -1 });
SpaServiceUsageSchema.index({ customerId: 1, usingDateTime: -1 });

module.exports = mongoose.models.SpaServiceUsage || mongoose.model('SpaServiceUsage', SpaServiceUsageSchema);
