const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  user_id_owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company_info: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
      },
      postal_code: String
    },
    contact: {
      phone: String,
      email: String
    },
    registration: {
      business_license: String,
      tax_id: String,
      registration_date: Date
    }
  },
  KYC_status: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  KYC_documents: [{
    type: {
      type: String,
      enum: ['business_license', 'tax_certificate', 'bank_statement', 'id_document']
    },
    url: String,
    uploaded_at: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  bank_info: {
    account_name: String,
    account_number: String,
    bank_name: String,
    branch: String,
    routing_number: String,
    swift_code: String,
    currency: String
  },
  payout_method: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe', 'wise'],
    default: 'bank_transfer'
  },
  commission_rate: {
    type: Number,
    default: 0.15, // 15% platform fee
    min: 0,
    max: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_approval'],
    default: 'pending_approval'
  },
  approved_at: Date,
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
SupplierSchema.index({ user_id_owner: 1 });
SupplierSchema.index({ KYC_status: 1 });
SupplierSchema.index({ status: 1 });

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);