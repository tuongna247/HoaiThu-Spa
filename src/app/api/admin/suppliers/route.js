import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import { hasPermission, PERMISSIONS } from '@/lib/roles';

// GET /api/admin/suppliers - Get all suppliers for admin
export async function GET(request) {
  try {
    await connectDB();
    
    // Verify authentication and admin permissions
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(authResult.user, PERMISSIONS.APPROVE_SUPPLIERS)) {
      return NextResponse.json({
        status: 403,
        msg: 'Insufficient permissions to view suppliers'
      }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const kyc_status = url.searchParams.get('kyc_status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (kyc_status) query.KYC_status = kyc_status;

    // Get suppliers with populated data
    const suppliers = await Supplier.find(query)
      .populate('user_id_owner', 'name email phone createdAt')
      .populate('approved_by', 'name email')
      .populate('company_info.address.country_id', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Supplier.countDocuments(query);

    // Format response data
    const formattedSuppliers = suppliers.map(supplier => ({
      _id: supplier._id,
      owner: supplier.user_id_owner,
      company_info: supplier.company_info,
      status: supplier.status,
      KYC_status: supplier.KYC_status,
      commission_rate: supplier.commission_rate,
      approved_at: supplier.approved_at,
      approved_by: supplier.approved_by,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    }));

    return NextResponse.json({
      status: 200,
      msg: 'Suppliers fetched successfully',
      data: formattedSuppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error'
    }, { status: 500 });
  }
}