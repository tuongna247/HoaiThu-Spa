import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomer from '@/models/SpaCustomer';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import { verifyToken } from '@/lib/auth';

// GET - List all customers with search and pagination
export async function GET(request) {
  try {
    const { success, user } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Get customers
    const customers = await SpaCustomer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get remaining services count for each customer
    const customersWithCount = await Promise.all(
      customers.map(async (customer) => {
        const purchases = await SpaCustomerPurchase.find({
          customerId: customer._id,
          status: 'active'
        });

        const totalRemaining = purchases.reduce((sum, p) => sum + p.timesRemaining, 0);

        return {
          ...customer,
          totalRemainingServices: totalRemaining
        };
      })
    );

    const total = await SpaCustomer.countDocuments(query);

    return NextResponse.json({
      status: 200,
      msg: 'Customers retrieved successfully',
      data: {
        customers: customersWithCount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create new customer
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
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      address,
      notes
    } = body;

    // Validation
    if (!firstName || !lastName || !phoneNumber || !dateOfBirth) {
      return NextResponse.json({
        status: 400,
        msg: 'First name, last name, phone number, and date of birth are required'
      }, { status: 400 });
    }

    // Check if phone number already exists
    const existingCustomer = await SpaCustomer.findOne({ phoneNumber });
    if (existingCustomer) {
      return NextResponse.json({
        status: 400,
        msg: 'Customer with this phone number already exists'
      }, { status: 400 });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await SpaCustomer.findOne({ email });
      if (existingEmail) {
        return NextResponse.json({
          status: 400,
          msg: 'Customer with this email already exists'
        }, { status: 400 });
      }
    }

    // Create customer
    const customer = new SpaCustomer({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth: new Date(dateOfBirth),
      address,
      notes
    });

    await customer.save();

    return NextResponse.json({
      status: 201,
      msg: 'Customer created successfully',
      data: { customer }
    }, { status: 201 });

  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
