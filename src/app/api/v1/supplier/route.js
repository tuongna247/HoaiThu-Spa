import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import SupplierUser from '@/models/SupplierUser';
import User from '@/models/User';

// POST /api/v1/supplier - Create new supplier profile
export async function POST(request) {
  try {
    await connectDB();
    
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const {
      company_info,
      bank_info,
      payout_method = 'bank_transfer'
    } = await request.json();

    // Validate required company info
    if (!company_info?.name || !company_info?.contact?.email) {
      return NextResponse.json({
        success: false,
        message: 'Company name and contact email are required'
      }, { status: 400 });
    }

    // Check if user already owns a supplier
    const existingSupplier = await Supplier.findOne({
      user_id_owner: authResult.user.userId
    });

    if (existingSupplier) {
      return NextResponse.json({
        success: false,
        message: 'User already owns a supplier account'
      }, { status: 409 });
    }

    // Create supplier profile
    const supplier = new Supplier({
      user_id_owner: authResult.user.userId,
      company_info,
      bank_info,
      payout_method,
      status: 'pending_approval'
    });

    await supplier.save();

    // Create owner entry in SupplierUser
    const supplierUser = new SupplierUser({
      supplier_id: supplier._id,
      user_id: authResult.user.userId,
      role: 'owner',
      permissions: [
        'manage_products', 'manage_bookings', 'manage_schedules',
        'view_analytics', 'manage_team', 'view_finances'
      ],
      status: 'active',
      joined_at: new Date()
    });

    await supplierUser.save();

    // Update user role if they're currently a customer
    await User.findByIdAndUpdate(authResult.user.userId, {
      role: 'supplier'
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier profile created successfully',
      data: {
        supplier: {
          id: supplier._id,
          company: supplier.company_info,
          status: supplier.status,
          kyc_status: supplier.KYC_status
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}

// GET /api/v1/supplier - Get user's supplier profiles
export async function GET(request) {
  try {
    await connectDB();
    
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Get all supplier roles for this user
    const supplierRoles = await SupplierUser.find({
      user_id: authResult.user.userId,
      status: 'active'
    })
    .populate({
      path: 'supplier_id',
      populate: {
        path: 'company_info.address.country_id',
        select: 'name code'
      }
    });

    const suppliers = supplierRoles.map(role => ({
      id: role.supplier_id._id,
      company: role.supplier_id.company_info,
      status: role.supplier_id.status,
      kyc_status: role.supplier_id.KYC_status,
      user_role: role.role,
      permissions: role.permissions
    }));

    return NextResponse.json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}