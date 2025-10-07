import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { isValidBookingId, isMongoObjectId } from "@/utils/bookingId";

// GET single booking
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    // Support multiple ID formats: bookingId, bookingReference, or MongoDB ObjectId
    let query;
    if (isValidBookingId(id)) {
      query = { bookingId: id };
    } else if (isMongoObjectId(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id };
    }
    
    const booking = await Booking.findOne(query)
      .populate('tour.tourId', 'title images location rating guide');
    
    if (!booking) {
      return NextResponse.json({
        status: 404,
        msg: "Booking not found"
      });
    }
    
    return NextResponse.json({
      status: 200,
      data: booking,
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

// PUT - Update booking
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await request.json();
    
    // Support multiple ID formats
    let query;
    if (isValidBookingId(id)) {
      query = { bookingId: id };
    } else if (isMongoObjectId(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id };
    }
    
    const updatedBooking = await Booking.findOneAndUpdate(query, data, { new: true })
      .populate('tour.tourId', 'title images location rating guide');
    
    if (!updatedBooking) {
      return NextResponse.json({
        status: 404,
        msg: "Booking not found"
      });
    }
    
    return NextResponse.json({
      status: 200,
      data: updatedBooking,
      msg: "Booking updated successfully"
    });
  } catch (error) {
    return NextResponse.json({
      status: 400,
      msg: "something went wrong",
      error: error.message
    });
  }
}

// DELETE - Cancel booking
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    // Support multiple ID formats
    let query;
    if (isValidBookingId(id)) {
      query = { bookingId: id };
    } else if (isMongoObjectId(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id };
    }
    
    const updatedBooking = await Booking.findOneAndUpdate(
      query,
      { 
        status: 'cancelled',
        'cancellation.cancelledAt': new Date(),
        'cancellation.cancelledBy': 'customer'
      },
      { new: true }
    ).populate('tour.tourId', 'title images location rating guide');
    
    if (!updatedBooking) {
      return NextResponse.json({
        status: 404,
        msg: "Booking not found"
      });
    }
    
    return NextResponse.json({
      status: 200,
      data: updatedBooking,
      msg: "Booking cancelled successfully"
    });
  } catch (error) {
    return NextResponse.json({
      status: 400,
      msg: "something went wrong",
      error: error.message
    });
  }
}