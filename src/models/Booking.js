import mongoose from 'mongoose';
import { generateBookingId, generateBookingReference } from '../utils/bookingId.js';

const BookingSchema = new mongoose.Schema({
  bookingId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => generateBookingId()
  },
  bookingReference: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  
  tour: {
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    title: { type: String, required: true },
    shortDescription: { type: String },
    description: { type: String },
    duration: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    currency: { type: String, default: 'USD' },
    category: { type: String },
    difficulty: { type: String },
    location: {
      city: { type: String },
      country: { type: String },
      address: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    images: [{
      url: { type: String },
      alt: { type: String },
      isPrimary: { type: Boolean, default: false }
    }],
    highlights: [{ type: String }],
    included: [{ type: String }],
    excluded: [{ type: String }],
    schedule: {
      startTime: { type: String },
      endTime: { type: String },
      meetingPoint: { type: String },
      availableDays: [{ type: String }],
      timeSlots: [{ type: String }]
    },
    capacity: {
      minimum: { type: Number },
      maximum: { type: Number }
    },
    guide: {
      name: { type: String },
      bio: { type: String },
      image: { type: String },
      languages: [{ type: String }],
      rating: { type: Number },
      experience: { type: String }
    },
    rating: {
      average: { type: Number },
      count: { type: Number }
    },
    cancellation: {
      policy: { type: String },
      refundable: { type: Boolean },
      cutoffHours: { type: Number }
    },
    selectedDate: { type: Date, required: true },
    selectedTimeSlot: { type: String, required: true }
  },
  
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    },
    dateOfBirth: { type: Date },
    nationality: { type: String }
  },
  
  participants: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
    totalCount: { type: Number, required: true },
    details: [{
      type: { type: String, enum: ['adult', 'child', 'infant'] },
      firstName: { type: String },
      lastName: { type: String },
      age: { type: Number },
      specialRequirements: { type: String }
    }]
  },
  
  pricing: {
    basePrice: { type: Number, required: true },
    adultPrice: { type: Number, required: true },
    childPrice: { type: Number, default: 0 },
    infantPrice: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'],
      required: false
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: { type: String },
    paymentDate: { type: Date },
    refundAmount: { type: Number, default: 0 },
    refundDate: { type: Date }
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  
  specialRequests: { type: String },
  
  confirmation: {
    code: { type: String },
    sentAt: { type: Date },
    method: { type: String, enum: ['email', 'sms'] }
  },
  
  cancellation: {
    reason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ['customer', 'admin'] },
    refundStatus: { type: String },
    refundAmount: { type: Number }
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate booking reference
BookingSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.bookingReference) {
      // Get the count of existing bookings to generate sequential reference
      const count = await mongoose.model('Booking').countDocuments();
      this.bookingReference = generateBookingReference(count + 1);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for efficient queries
BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ bookingReference: 1 });
BookingSchema.index({ 'customer.email': 1 });
BookingSchema.index({ 'tour.tourId': 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'payment.status': 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);