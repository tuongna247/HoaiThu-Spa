import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaPromotion from '@/models/SpaPromotion';
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

    const total = await SpaPromotion.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Promotions retrieved successfully',
      data: {
        promotions,
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
      name,
      description,
      reduceTimes,
      discountPercentage,
      discountAmount,
      startDate,
      endDate
    } = body;

    // Validation
    if (!name || !description || !reduceTimes) {
      return NextResponse.json({
        status: 400,
        msg: 'Name, description, and reduce times are required'
      }, { status: 400 });
    }

    // Create promotion
    const promotion = new SpaPromotion({
      name,
      description,
      reduceTimes,
      discountPercentage: discountPercentage || 0,
      discountAmount: discountAmount || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null
    });

    await promotion.save();

    return NextResponse.json({
      status: 201,
      msg: 'Promotion created successfully',
      data: { promotion }
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
