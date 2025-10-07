import { NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// Helper function to get user from session or JWT token
async function getUserFromRequest(request) {
  try {
    // First try to get user from NextAuth session
    const { getServerSession } = await import('next-auth');
    
    // Import authOptions from the NextAuth configuration
    const { authOptions } = await import('../../auth/[...nextauth]/route.js');
    
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const user = await User.findById(session.user.id).select('-password');
        if (user && user.isActive) {
          return user;
        }
      }
    } catch (sessionError) {
    }
    
    // Fallback to JWT token for local authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No authentication provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      throw new Error('Invalid token');
    }
    
    return user;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

// GET all tours for admin (including inactive ones)
export async function GET(request) {
  try {
    await connectDB();
    
    // Get user from session or token for role-based filtering
    let user = null;
    try {
      user = await getUserFromRequest(request);
    } catch (authError) {
      return NextResponse.json({
        status: 401,
        msg: "Authentication required"
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 100);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, inactive, all
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object based on user role
    let filter = {};
    
    // Role-based filtering: mods can only see their own tours
    if (user.role === 'mod') {
      filter.createdBy = user._id;
    }
    // Admins can see all tours, customers shouldn't access this endpoint

    // Filter by status for admin
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    // If status is 'all' or not specified, show all tours

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.$or = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') }
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const tours = await Tour.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Tour.countDocuments(filter);

    // Get stats for admin dashboard (filtered by user role)
    const baseStatsFilter = user.role === 'mod' ? { createdBy: user._id } : {};
    const stats = {
      total: await Tour.countDocuments(baseStatsFilter),
      active: await Tour.countDocuments({ ...baseStatsFilter, isActive: true }),
      inactive: await Tour.countDocuments({ ...baseStatsFilter, isActive: false }),
      featured: await Tour.countDocuments({ ...baseStatsFilter, isFeatured: true }),
    };

    return NextResponse.json({
      status: 200,
      data: {
        tours,
        stats,
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
    console.error('Admin get tours error:', error);
    return NextResponse.json({
      status: 500,
      msg: "Failed to fetch tours",
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new tour (admin)
export async function POST(request) {
  try {
    await connectDB();
    
    // Get user from session or token for authentication
    let user = null;
    try {
      user = await getUserFromRequest(request);
    } catch (authError) {
      return NextResponse.json({
        status: 401,
        msg: "Authentication required"
      }, { status: 401 });
    }
    
    // Check if user has permission to create tours (admin or mod)
    if (!['admin', 'mod'].includes(user.role)) {
      return NextResponse.json({
        status: 403,
        msg: "Access denied. Only admins and moderators can create tours."
      }, { status: 403 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json({
        status: 400,
        msg: "Tour title is required"
      }, { status: 400 });
    }
    
    // Set defaults for optional fields
    const tourData = {
      title: data.title,
      description: data.description || "",
      category: data.category || "Adventure",
      price: data.price || 0,
      duration: data.duration || "1 day",
      location: {
        city: data.location?.city || "",
        country: data.location?.country || "",
        coordinates: data.location?.coordinates || [0, 0]
      },
      images: data.images || [],
      features: data.features || [],
      schedule: data.schedule || [],
      guide: {
        name: data.guide?.name || "",
        experience: data.guide?.experience || "",
        languages: data.guide?.languages || [],
        rating: data.guide?.rating || 0
      },
      maxParticipants: data.maxParticipants || 10,
      rating: data.rating || 0,
      totalReviews: data.totalReviews || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      createdBy: user._id,
      ...data
    };
    
    // Create new tour
    const newTour = new Tour(tourData);
    await newTour.save();
    
    return NextResponse.json({
      status: 201,
      data: newTour,
      msg: "Tour created successfully"
    }, { status: 201 });
    
  } catch (error) {
    console.error('Admin create tour error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return NextResponse.json({
        status: 400,
        msg: 'Validation error',
        errors: validationErrors,
        details: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 500,
      msg: "Failed to create tour",
      error: error.message
    }, { status: 500 });
  }
}