import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import SpaServicePromotion from '@/models/SpaServicePromotion';
import SpaCustomer from '@/models/SpaCustomer';
import { verifyToken } from '@/lib/auth';

// GET - List all purchases
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
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (customerId) {
      query.customerId = customerId;
    }

    if (status) {
      query.status = status;
    }

    const purchases = await SpaCustomerPurchase.find(query)
      .populate('customerId')
      .populate({
        path: 'servicePromotionId',
        populate: [
          { path: 'serviceId' },
          { path: 'promotionId' }
        ]
      })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SpaCustomerPurchase.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Purchases retrieved successfully',
      data: {
        purchases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create new purchase (customer buys service package)
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
      customerId,
      servicePromotionId,
      paymentAmount,
      paymentMethod,
      expiryDate,
      notes
    } = body;

    // Validation
    if (!customerId || !servicePromotionId || !paymentAmount) {
      return NextResponse.json({
        status: 400,
        msg: 'Customer ID, Service Promotion ID, and Payment Amount are required'
      }, { status: 400 });
    }

    // Verify customer exists
    const customer = await SpaCustomer.findById(customerId);
    if (!customer) {
      return NextResponse.json({
        status: 404,
        msg: 'Customer not found'
      }, { status: 404 });
    }

    // Verify service promotion exists
    const servicePromotion = await SpaServicePromotion.findById(servicePromotionId);
    if (!servicePromotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Service promotion not found'
      }, { status: 404 });
    }

    // Create purchase
    const purchase = new SpaCustomerPurchase({
      customerId,
      servicePromotionId,
      paymentAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentDate: new Date(),
      totalTimesIncluded: servicePromotion.timesIncluded,
      timesUsed: 0,
      timesRemaining: servicePromotion.timesIncluded,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'active',
      notes: notes || ''
    });

    await purchase.save();

    // Populate the response
    await purchase.populate([
      'customerId',
      {
        path: 'servicePromotionId',
        populate: [
          { path: 'serviceId' },
          { path: 'promotionId' }
        ]
      }
    ]);

    return NextResponse.json({
      status: 201,
      msg: 'Purchase created successfully',
      data: { purchase }
    }, { status: 201 });

  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
