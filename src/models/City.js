const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
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
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  timezone: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  image_url: {
    type: String
  },
  is_popular: {
    type: Boolean,
    default: false
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
CitySchema.index({ country_id: 1 });
CitySchema.index({ slug: 1 });
CitySchema.index({ is_active: 1, is_popular: 1 });
CitySchema.index({ display_order: 1 });

module.exports = mongoose.models.City || mongoose.model('City', CitySchema);