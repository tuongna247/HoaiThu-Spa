const mongoose = require('mongoose');

const SpaCustomerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,  // Allows null/undefined values for unique index
    validate: {
      validator: function(v) {
        if (!v) return true; // Email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 20
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  // Computed field to track remaining services
  totalRemainingServices: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
SpaCustomerSchema.index({ phoneNumber: 1 });
SpaCustomerSchema.index({ email: 1 });
SpaCustomerSchema.index({ firstName: 1, lastName: 1 });
SpaCustomerSchema.index({ isActive: 1 });

// Virtual for full name
SpaCustomerSchema.virtual('fullName').get(function() {
  const middle = this.middleName ? ` ${this.middleName} ` : ' ';
  return `${this.firstName}${middle}${this.lastName}`;
});

// Ensure virtuals are included in JSON
SpaCustomerSchema.set('toJSON', { virtuals: true });
SpaCustomerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.SpaCustomer || mongoose.model('SpaCustomer', SpaCustomerSchema);
