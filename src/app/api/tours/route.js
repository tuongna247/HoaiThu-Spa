import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 100);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    const sort = {};
    
    // Handle special sort cases
    if (sortBy === 'latest') {
      sort['createdAt'] = -1;
    } else if (sortBy === 'price_low') {
      sort['price'] = 1;
    } else if (sortBy === 'price_high') {
      sort['price'] = -1;
    } else if (sortBy === 'rating') {
      sort['averageRating'] = -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const tours = await Tour.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-reviews'); // Exclude reviews for performance

    const total = await Tour.countDocuments(filter);

    return NextResponse.json({
      status: 200,
      data: {
        tours,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      msg: 'success'
    });

  } catch (error) {
    console.error('Get tours error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Failed to fetch tours',
      error: error.message
    }, { status: 500 });
  }
}