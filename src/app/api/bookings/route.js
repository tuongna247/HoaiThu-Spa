import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { generateBookingId, generateBookingReference } from "@/utils/bookingId";

// GET all bookings with filtering
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const tourId = searchParams.get('tourId');
    const bookingId = searchParams.get('bookingId');
    
    // Build filter query
    let filter = {};
    if (status) filter.status = status;
    if (email) filter['customer.email'] = email;
    if (tourId) filter['tour.tourId'] = tourId;
    if (bookingId) {
      filter.$or = [
        { bookingId: bookingId },
        { bookingReference: bookingId }
      ];
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate('tour.tourId', 'title images location rating guide')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Booking.countDocuments(filter);
    
    // Calculate stats
    const stats = {
      total: await Booking.countDocuments(),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      pending: await Booking.countDocuments({ status: 'pending' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      totalRevenue: await Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]).then(result => result[0]?.total || 0)
    };
    
    return NextResponse.json({
      status: 200,
      data: {
        bookings,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      msg: "success"
    });
  } catch (error) {
    return NextResponse.json({
      status: 400,
      msg: "something went wrong",
      error: error.message
    });
  }
}

// POST - Create new booking
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    
    // Validate required fields
    if (!data.tour?.tourId) {
      return NextResponse.json({
        status: 400,
        msg: "Tour ID is required"
      });
    }
    
    if (!data.customer?.firstName || !data.customer?.lastName || !data.customer?.email || !data.customer?.phone) {
      return NextResponse.json({
        status: 400,
        msg: "Customer first name, last name, email, and phone are required"
      });
    }
    
    if (!data.participants?.adults || data.participants.adults < 1) {
      return NextResponse.json({
        status: 400,
        msg: "At least 1 adult participant is required"
      });
    }
    
    if (!data.tour?.selectedDate) {
      return NextResponse.json({
        status: 400,
        msg: "Tour date is required"
      });
    }
    
    // Set defaults for optional fields
    const bookingData = {
      tour: {
        tourId: data.tour.tourId,
        title: data.tour.title || "Tour",
        price: data.tour.price || 0,
        selectedDate: data.tour.selectedDate || new Date(),
        selectedTimeSlot: data.tour.selectedTimeSlot || "09:00 AM",
        ...data.tour
      },
      customer: {
        ...data.customer
      },
      participants: {
        adults: data.participants.adults,
        children: data.participants.children || 0,
        infants: data.participants.infants || 0,
        totalCount: (data.participants.adults || 0) + (data.participants.children || 0) + (data.participants.infants || 0),
        ...data.participants
      },
      pricing: (() => {
        const basePrice = data.pricing?.basePrice || data.tour?.price || 0;
        const adultPrice = data.pricing?.adultPrice || data.tour?.price || basePrice;
        const childPrice = data.pricing?.childPrice || Math.round(adultPrice * 0.7); // 70% of adult price
        const infantPrice = data.pricing?.infantPrice || 0;
        
        const adults = data.participants?.adults || 0;
        const children = data.participants?.children || 0;
        const infants = data.participants?.infants || 0;
        
        const subtotal = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
        const taxes = data.pricing?.taxes || Math.round(subtotal * 0.1); // 10% tax
        const fees = data.pricing?.fees || 0;
        const discount = data.pricing?.discount || 0;
        const total = subtotal + taxes + fees - discount;
        
        return {
          basePrice,
          adultPrice,
          childPrice,
          infantPrice,
          subtotal,
          taxes,
          fees,
          discount,
          total,
          currency: data.pricing?.currency || 'USD'
        };
      })(),
      status: data.payment?.method ? "confirmed" : "pending",
      payment: data.payment || { status: 'pending' },
      specialRequests: data.specialRequests || "",
      confirmation: data.payment?.method ? {
        code: `CNF-${Date.now()}`,
        sentAt: new Date(),
        method: "email"
      } : undefined
    };
    
    // Create new booking
    const newBooking = new Booking(bookingData);
    await newBooking.save();
    
    // Populate tour details for response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('tour.tourId', 'title images location rating guide currency price');
    
    return NextResponse.json({
      status: 201,
      data: populatedBooking,
      msg: "Booking created successfully"
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return NextResponse.json({
        status: 400,
        msg: 'Validation error',
        errors: validationErrors,
        details: error.message
      });
    }
    
    if (error.code === 11000) {
      return NextResponse.json({
        status: 400,
        msg: 'Duplicate booking ID',
        error: 'A booking with this ID already exists'
      });
    }
    
    return NextResponse.json({
      status: 500,
      msg: "Failed to create booking",
      error: error.message
    });
  }
}