import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaPromotion from '@/models/SpaPromotion';
import { verifyToken } from '@/lib/auth';

// GET - Get promotion details
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
    const promotion = await SpaPromotion.findById(id);

    if (!promotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Promotion not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      msg: 'Promotion retrieved successfully',
      data: { promotion }
    });

  } catch (error) {
    console.error('Get promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update promotion
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

    const promotion = await SpaPromotion.findById(id);

    if (!promotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Promotion not found'
      }, { status: 404 });
    }

    // Update promotion
    const updatedPromotion = await SpaPromotion.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      status: 200,
      msg: 'Promotion updated successfully',
      data: { promotion: updatedPromotion }
    });

  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete promotion
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

    const promotion = await SpaPromotion.findById(id);

    if (!promotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Promotion not found'
      }, { status: 404 });
    }

    // Soft delete
    promotion.isActive = false;
    await promotion.save();

    return NextResponse.json({
      status: 200,
      msg: 'Promotion deleted successfully',
      data: { promotion }
    });

  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
