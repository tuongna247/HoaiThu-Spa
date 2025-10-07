import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaServiceUsage from '@/models/SpaServiceUsage';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import { verifyToken } from '@/lib/auth';

// GET - List all usage records
export async function GET(request) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const customerId = searchParams.get('customerId');
    const purchaseId = searchParams.get('purchaseId');

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (customerId) {
      query.customerId = customerId;
    }

    if (purchaseId) {
      query.customerPurchaseId = purchaseId;
    }

    const usageRecords = await SpaServiceUsage.find(query)
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
      })
      .sort({ usingDateTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SpaServiceUsage.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Usage records retrieved successfully',
      data: {
        usageRecords,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get usage records error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Record service usage (customer uses one time from package)
export async function POST(request) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      customerPurchaseId,
      customerId,
      staffMember,
      note,
      rating,
      feedbackComments,
      usingDateTime
    } = body;

    // Validation
    if (!customerPurchaseId || !customerId) {
      return NextResponse.json({
        status: 400,
        msg: 'Customer Purchase ID and Customer ID are required'
      }, { status: 400 });
    }

    // Get the purchase
    const purchase = await SpaCustomerPurchase.findById(customerPurchaseId);

    if (!purchase) {
      return NextResponse.json({
        status: 404,
        msg: 'Purchase not found'
      }, { status: 404 });
    }

    // Check if purchase belongs to customer
    if (purchase.customerId.toString() !== customerId) {
      return NextResponse.json({
        status: 400,
        msg: 'Purchase does not belong to this customer'
      }, { status: 400 });
    }

    // Check if purchase is active and has remaining times
    if (purchase.status !== 'active') {
      return NextResponse.json({
        status: 400,
        msg: `Purchase status is ${purchase.status}. Only active purchases can be used.`
      }, { status: 400 });
    }

    if (purchase.timesRemaining <= 0) {
      return NextResponse.json({
        status: 400,
        msg: 'No remaining uses for this purchase'
      }, { status: 400 });
    }

    // Check expiry
    if (purchase.expiryDate && purchase.expiryDate < new Date()) {
      // Update purchase status
      purchase.status = 'expired';
      await purchase.save();

      return NextResponse.json({
        status: 400,
        msg: 'This purchase has expired'
      }, { status: 400 });
    }

    // Decrement times remaining
    purchase.timesUsed += 1;
    purchase.timesRemaining -= 1;

    // Update status if all uses are consumed
    if (purchase.timesRemaining === 0) {
      purchase.status = 'completed';
    }

    await purchase.save();

    // Create usage record
    const usage = new SpaServiceUsage({
      customerPurchaseId,
      customerId,
      usingDateTime: usingDateTime ? new Date(usingDateTime) : new Date(),
      remainingAfterUse: purchase.timesRemaining,
      staffMember: staffMember || '',
      note: note || '',
      rating: rating || null,
      feedbackComments: feedbackComments || ''
    });

    await usage.save();

    // Populate the response
    await usage.populate([
      'customerId',
      {
        path: 'customerPurchaseId',
        populate: {
          path: 'servicePromotionId',
          populate: [
            { path: 'serviceId' },
            { path: 'promotionId' }
          ]
        }
      }
    ]);

    return NextResponse.json({
      status: 201,
      msg: 'Service usage recorded successfully',
      data: {
        usage,
        purchaseUpdate: {
          timesUsed: purchase.timesUsed,
          timesRemaining: purchase.timesRemaining,
          status: purchase.status
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Record usage error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
