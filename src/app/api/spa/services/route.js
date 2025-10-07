import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaService from '@/models/SpaService';
import { verifyToken } from '@/lib/auth';

// GET - List all services
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
    const category = searchParams.get('category');
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

    if (category) {
      query.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await SpaService.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SpaService.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Services retrieved successfully',
      data: {
        services,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    const { success, user } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, basePrice, duration, category, imageUrl } = body;

    // Validation
    if (!name || !description || !basePrice || !duration) {
      return NextResponse.json({
        status: 400,
        msg: 'Name, description, base price, and duration are required'
      }, { status: 400 });
    }

    // Check if service name already exists
    const existingService = await SpaService.findOne({ name });
    if (existingService) {
      return NextResponse.json({
        status: 400,
        msg: 'Service with this name already exists'
      }, { status: 400 });
    }

    // Create service
    const service = new SpaService({
      name,
      description,
      basePrice,
      duration,
      category: category || 'other',
      imageUrl: imageUrl || ''
    });

    await service.save();

    return NextResponse.json({
      status: 201,
      msg: 'Service created successfully',
      data: { service }
    }, { status: 201 });

  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
