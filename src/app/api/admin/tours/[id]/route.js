import { NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';

// GET single tour by ID (admin can see inactive tours)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    
    const tour = await Tour.findById(id); // Admin can see all tours, including inactive ones
    
    
    if (!tour) {
      return NextResponse.json({
        status: 404,
        msg: 'Tour not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      data: tour,
      msg: 'success'
    });

  } catch (error) {
    console.error('Admin get tour error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Failed to fetch tour',
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update tour
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await request.json();
    
    const tour = await Tour.findById(id);
    if (!tour) {
      return NextResponse.json({
        status: 404,
        msg: 'Tour not found'
      }, { status: 404 });
    }
    
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      status: 200,
      data: updatedTour,
      msg: "Tour updated successfully"
    });
    
  } catch (error) {
    console.error('Admin update tour error:', error);
    
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
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 500,
      msg: "Failed to update tour",
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete tour (soft delete)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    
    const tour = await Tour.findById(id);
    if (!tour) {
      return NextResponse.json({
        status: 404,
        msg: 'Tour not found'
      }, { status: 404 });
    }
    
    // Soft delete by setting isActive to false
    const deletedTour = await Tour.findByIdAndUpdate(
      id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );
    
    return NextResponse.json({
      status: 200,
      data: deletedTour,
      msg: "Tour deleted successfully"
    });
    
  } catch (error) {
    console.error('Admin delete tour error:', error);
    return NextResponse.json({
      status: 500,
      msg: "Failed to delete tour",
      error: error.message
    }, { status: 500 });
  }
}