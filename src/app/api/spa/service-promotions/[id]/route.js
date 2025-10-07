import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaServicePromotion from '@/models/SpaServicePromotion';
import { verifyToken } from '@/lib/auth';

// GET - Get service promotion details
export async function GET(request, { params }) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    const servicePromotion = await SpaServicePromotion.findById(id)
      .populate('serviceId')
      .populate('promotionId');

    if (!servicePromotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Service promotion not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      msg: 'Service promotion retrieved successfully',
      data: { servicePromotion }
    });

  } catch (error) {
    console.error('Get service promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update service promotion
export async function PUT(request, { params }) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    const servicePromotion = await SpaServicePromotion.findById(id);

    if (!servicePromotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Service promotion not found'
      }, { status: 404 });
    }

    // Update service promotion
    const updatedServicePromotion = await SpaServicePromotion.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      status: 200,
      msg: 'Service promotion updated successfully',
      data: { servicePromotion: updatedServicePromotion }
    });

  } catch (error) {
    console.error('Update service promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete service promotion
export async function DELETE(request, { params }) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    const servicePromotion = await SpaServicePromotion.findById(id);

    if (!servicePromotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Service promotion not found'
      }, { status: 404 });
    }

    // Soft delete
    servicePromotion.isActive = false;
    await servicePromotion.save();

    return NextResponse.json({
      status: 200,
      msg: 'Service promotion deleted successfully',
      data: { servicePromotion }
    });

  } catch (error) {
    console.error('Delete service promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
