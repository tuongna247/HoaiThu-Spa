import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaServicePromotion from '@/models/SpaServicePromotion';
import SpaService from '@/models/SpaService';
import SpaPromotion from '@/models/SpaPromotion';
import { verifyToken } from '@/lib/auth';

// GET - List all service promotions
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
    const serviceId = searchParams.get('serviceId');
    const promotionId = searchParams.get('promotionId');
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (serviceId) {
      query.serviceId = serviceId;
    }

    if (promotionId) {
      query.promotionId = promotionId;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const servicePromotions = await SpaServicePromotion.find(query)
      .populate('serviceId')
      .populate('promotionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SpaServicePromotion.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Service promotions retrieved successfully',
      data: {
        servicePromotions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get service promotions error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create service promotion (assign promotion to service)
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
    const { serviceId, promotionId } = body;

    // Validation
    if (!serviceId || !promotionId) {
      return NextResponse.json({
        status: 400,
        msg: 'Service ID and Promotion ID are required'
      }, { status: 400 });
    }

    // Get service and promotion
    const service = await SpaService.findById(serviceId);
    const promotion = await SpaPromotion.findById(promotionId);

    if (!service) {
      return NextResponse.json({
        status: 404,
        msg: 'Service not found'
      }, { status: 404 });
    }

    if (!promotion) {
      return NextResponse.json({
        status: 404,
        msg: 'Promotion not found'
      }, { status: 404 });
    }

    // Check if combination already exists
    const existing = await SpaServicePromotion.findOne({ serviceId, promotionId });
    if (existing) {
      return NextResponse.json({
        status: 400,
        msg: 'This service-promotion combination already exists'
      }, { status: 400 });
    }

    // Calculate final price
    let finalPrice = service.basePrice;

    if (promotion.discountPercentage > 0) {
      finalPrice = finalPrice * (1 - promotion.discountPercentage / 100);
    }

    if (promotion.discountAmount > 0) {
      finalPrice = Math.max(0, finalPrice - promotion.discountAmount);
    }

    // Create service promotion
    const servicePromotion = new SpaServicePromotion({
      serviceId,
      serviceName: service.name,
      promotionId,
      promotionName: promotion.name,
      finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
      timesIncluded: promotion.reduceTimes
    });

    await servicePromotion.save();

    return NextResponse.json({
      status: 201,
      msg: 'Service promotion created successfully',
      data: { servicePromotion }
    }, { status: 201 });

  } catch (error) {
    console.error('Create service promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
