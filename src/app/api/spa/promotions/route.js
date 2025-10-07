import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaPromotion from '@/models/SpaPromotion';
import SpaService from '@/models/SpaService';
import SpaServicePromotion from '@/models/SpaServicePromotion';
import { verifyToken } from '@/lib/auth';

// GET - List all promotions
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
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const promotions = await SpaPromotion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch linked services for each promotion
    const promotionsWithServices = await Promise.all(
      promotions.map(async (promotion) => {
        const servicePromotions = await SpaServicePromotion.find({
          promotionId: promotion._id
        }).populate('serviceId').lean();

        return {
          ...promotion,
          promotionName: promotion.name,
          times: promotion.reduceTimes,
          discountPercent: promotion.discountPercentage,
          services: servicePromotions.map(sp => sp.serviceId).filter(s => s),
          servicePromotions: servicePromotions
        };
      })
    );

    const total = await SpaPromotion.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Promotions retrieved successfully',
      data: {
        promotions: promotionsWithServices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get promotions error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create new promotion
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
      promotionName,
      description,
      times,
      discountPercent,
      serviceIds
    } = body;

    // Validation
    if (!promotionName || !description || !times) {
      return NextResponse.json({
        status: 400,
        msg: 'Promotion name, description, and times are required'
      }, { status: 400 });
    }

    if (!serviceIds || serviceIds.length === 0) {
      return NextResponse.json({
        status: 400,
        msg: 'At least one service must be selected'
      }, { status: 400 });
    }

    // Create promotion
    const promotion = new SpaPromotion({
      name: promotionName,
      description,
      reduceTimes: times,
      discountPercentage: discountPercent || 0,
      discountAmount: 0,
      startDate: new Date(),
      endDate: null
    });

    await promotion.save();

    // Create service-promotion links
    const servicePromotions = [];
    for (const serviceId of serviceIds) {
      const service = await SpaService.findById(serviceId);
      if (!service) continue;

      // Calculate final price with discount
      const discountAmount = (service.basePrice * (discountPercent || 0)) / 100;
      const finalPrice = service.basePrice - discountAmount;

      const servicePromotion = new SpaServicePromotion({
        serviceId: service._id,
        serviceName: service.name,
        promotionId: promotion._id,
        promotionName: promotion.name,
        finalPrice: finalPrice,
        timesIncluded: times
      });

      await servicePromotion.save();
      servicePromotions.push(servicePromotion);
    }

    return NextResponse.json({
      status: 201,
      msg: 'Promotion created successfully',
      data: {
        promotion,
        servicePromotions
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create promotion error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
