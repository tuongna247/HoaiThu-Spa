import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaServiceUsage from '@/models/SpaServiceUsage';
import { verifyToken } from '@/lib/auth';

// GET - Get usage details
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

    const usage = await SpaServiceUsage.findById(id)
      .populate('customerId')
      .populate({
        path: 'customerPurchaseId',
        populate: {
          path: 'servicePromotionId',
          populate: [
            { path: 'serviceId' },
            { path: 'promotionId' }
          ]
        }
      });

    if (!usage) {
      return NextResponse.json({
        status: 404,
        msg: 'Usage record not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      msg: 'Usage record retrieved successfully',
      data: { usage }
    });

  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update usage record
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

    const usage = await SpaServiceUsage.findById(id);

    if (!usage) {
      return NextResponse.json({
        status: 404,
        msg: 'Usage record not found'
      }, { status: 404 });
    }

    // Update usage record (typically for adding notes, rating, feedback)
    const updatedUsage = await SpaServiceUsage.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('customerId')
     .populate({
        path: 'customerPurchaseId',
        populate: {
          path: 'servicePromotionId',
          populate: [
            { path: 'serviceId' },
            { path: 'promotionId' }
          ]
        }
      });

    return NextResponse.json({
      status: 200,
      msg: 'Usage record updated successfully',
      data: { usage: updatedUsage }
    });

  } catch (error) {
    console.error('Update usage error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete usage record (admin only, reverses the usage count)
export async function DELETE(request, { params }) {
  try {
    const { success, user } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    // Only admin can delete usage records
    if (user.role !== 'admin') {
      return NextResponse.json({
        status: 403,
        msg: 'Only admins can delete usage records'
      }, { status: 403 });
    }

    await connectDB();

    const { id } = params;

    const usage = await SpaServiceUsage.findById(id);

    if (!usage) {
      return NextResponse.json({
        status: 404,
        msg: 'Usage record not found'
      }, { status: 404 });
    }

    // Get the associated purchase and reverse the usage
    const purchase = await SpaCustomerPurchase.findById(usage.customerPurchaseId);

    if (purchase) {
      purchase.timesUsed = Math.max(0, purchase.timesUsed - 1);
      purchase.timesRemaining = purchase.totalTimesIncluded - purchase.timesUsed;

      // Update status back to active if it was completed
      if (purchase.status === 'completed' && purchase.timesRemaining > 0) {
        purchase.status = 'active';
      }

      await purchase.save();
    }

    // Delete usage record
    await SpaServiceUsage.findByIdAndDelete(id);

    return NextResponse.json({
      status: 200,
      msg: 'Usage record deleted and purchase count restored',
      data: {
        deletedUsage: usage,
        purchaseUpdate: purchase ? {
          timesUsed: purchase.timesUsed,
          timesRemaining: purchase.timesRemaining,
          status: purchase.status
        } : null
      }
    });

  } catch (error) {
    console.error('Delete usage error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
