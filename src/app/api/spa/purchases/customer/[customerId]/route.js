import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import { verifyToken } from '@/lib/auth';

// GET - Get all purchases for a specific customer
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

    const { customerId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Build query
    const query = { customerId };

    if (status) {
      query.status = status;
    }

    if (activeOnly) {
      query.status = 'active';
      query.timesRemaining = { $gt: 0 };
    }

    const purchases = await SpaCustomerPurchase.find(query)
      .populate({
        path: 'servicePromotionId',
        populate: [
          { path: 'serviceId' },
          { path: 'promotionId' }
        ]
      })
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json({
      status: 200,
      msg: 'Customer purchases retrieved successfully',
      data: {
        purchases,
        totalPurchases: purchases.length,
        totalRemaining: purchases
          .filter(p => p.status === 'active')
          .reduce((sum, p) => sum + p.timesRemaining, 0)
      }
    });

  } catch (error) {
    console.error('Get customer purchases error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
