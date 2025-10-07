const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 2 // ISO 3166-1 alpha-2
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    length: 3 // ISO 4217
  },
  timezone: {
    type: String,
    required: true
  },
  locale: {
    type: String,
    default: 'en'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
CountrySchema.index({ code: 1 });
CountrySchema.index({ isActive: 1 });

module.exports = mongoose.models.Country || mongoose.model('Country', CountrySchema);