import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomer from '@/models/SpaCustomer';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import SpaServiceUsage from '@/models/SpaServiceUsage';
import { verifyToken } from '@/lib/auth';

// GET - Get customer details
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

    const { id } = params;

    const customer = await SpaCustomer.findById(id);

    if (!customer) {
      return NextResponse.json({
        status: 404,
        msg: 'Customer not found'
      }, { status: 404 });
    }

    // Get purchase history
    const purchases = await SpaCustomerPurchase.find({ customerId: id })
      .populate('servicePromotionId')
      .sort({ paymentDate: -1 })
      .lean();

    // Get usage history
    const usageHistory = await SpaServiceUsage.find({ customerId: id })
      .populate('customerPurchaseId')
      .sort({ usingDateTime: -1 })
      .limit(20)
      .lean();

    // Calculate total remaining
    const activePurchases = purchases.filter(p => p.status === 'active');
    const totalRemaining = activePurchases.reduce((sum, p) => sum + p.timesRemaining, 0);

    return NextResponse.json({
      status: 200,
      msg: 'Customer details retrieved successfully',
      data: {
        customer: {
          ...customer.toObject(),
          totalRemainingServices: totalRemaining
        },
        purchases,
        usageHistory
      }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(request, { params }) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    const customer = await SpaCustomer.findById(id);

    if (!customer) {
      return NextResponse.json({
        status: 404,
        msg: 'Customer not found'
      }, { status: 404 });
    }

    // Check if phone number is being changed and if it's unique
    if (body.phoneNumber && body.phoneNumber !== customer.phoneNumber) {
      const existingPhone = await SpaCustomer.findOne({
        phoneNumber: body.phoneNumber,
        _id: { $ne: id }
      });

      if (existingPhone) {
        return NextResponse.json({
          status: 400,
          msg: 'Phone number already exists'
        }, { status: 400 });
      }
    }

    // Check if email is being changed and if it's unique
    if (body.email && body.email !== customer.email) {
      const existingEmail = await SpaCustomer.findOne({
        email: body.email,
        _id: { $ne: id }
      });

      if (existingEmail) {
        return NextResponse.json({
          status: 400,
          msg: 'Email already exists'
        }, { status: 400 });
      }
    }

    // Update customer
    const updatedCustomer = await SpaCustomer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      status: 200,
      msg: 'Customer updated successfully',
      data: { customer: updatedCustomer }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete customer (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { success, user } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    // Only admin can delete
    if (user.role !== 'admin') {
      return NextResponse.json({
        status: 403,
        msg: 'Only admins can delete customers'
      }, { status: 403 });
    }

    await connectDB();

    const { id } = params;

    const customer = await SpaCustomer.findById(id);

    if (!customer) {
      return NextResponse.json({
        status: 404,
        msg: 'Customer not found'
      }, { status: 404 });
    }

    // Soft delete - just mark as inactive
    customer.isActive = false;
    await customer.save();

    return NextResponse.json({
      status: 200,
      msg: 'Customer deleted successfully',
      data: { customer }
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
