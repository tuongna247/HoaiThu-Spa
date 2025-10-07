import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import { verifyToken } from '@/lib/auth';

// GET - Get purchase details
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

    const purchase = await SpaCustomerPurchase.findById(id)
      .populate('customerId')
      .populate({
        path: 'servicePromotionId',
        populate: [
          { path: 'serviceId' },
          { path: 'promotionId' }
        ]
      });

    if (!purchase) {
      return NextResponse.json({
        status: 404,
        msg: 'Purchase not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      msg: 'Purchase retrieved successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Get purchase error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update purchase
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

    const purchase = await SpaCustomerPurchase.findById(id);

    if (!purchase) {
      return NextResponse.json({
        status: 404,
        msg: 'Purchase not found'
      }, { status: 404 });
    }

    // Update purchase
    const updatedPurchase = await SpaCustomerPurchase.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('customerId')
     .populate({
        path: 'servicePromotionId',
        populate: [
          { path: 'serviceId' },
          { path: 'promotionId' }
        ]
      });

    return NextResponse.json({
      status: 200,
      msg: 'Purchase updated successfully',
      data: { purchase: updatedPurchase }
    });

  } catch (error) {
    console.error('Update purchase error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Cancel purchase
export async function DELETE(request, { params }) {
  try {
    const { success, user } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    const purchase = await SpaCustomerPurchase.findById(id);

    if (!purchase) {
      return NextResponse.json({
        status: 404,
        msg: 'Purchase not found'
      }, { status: 404 });
    }

    // Set status to cancelled
    purchase.status = 'cancelled';
    await purchase.save();

    return NextResponse.json({
      status: 200,
      msg: 'Purchase cancelled successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Cancel purchase error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
