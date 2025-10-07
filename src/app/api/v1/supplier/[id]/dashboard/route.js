import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import SupplierUser from '@/models/SupplierUser';

// GET /api/v1/supplier/:id/dashboard - Get supplier dashboard data
export async function GET(request, { params }) {
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

    const supplierId = params.id;

    // Check if user has access to this supplier
    const supplierAccess = await SupplierUser.findOne({
      supplier_id: supplierId,
      user_id: authResult.user.userId,
      status: 'active'
    });

    if (!supplierAccess && authResult.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Access denied'
      }, { status: 403 });
    }

    // Get supplier details
    const supplier = await Supplier.findById(supplierId)
      .populate('user_id_owner', 'name email')
      .populate('company_info.address.country_id', 'name code');

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: 'Supplier not found'
      }, { status: 404 });
    }

    // Get team members
    const team = await SupplierUser.getSupplierTeam(supplierId);

    // TODO: Add booking stats, revenue data, etc.
    const dashboardData = {
      supplier: {
        id: supplier._id,
        company: supplier.company_info,
        status: supplier.status,
        kyc_status: supplier.KYC_status,
        commission_rate: supplier.commission_rate,
        created_at: supplier.createdAt
      },
      team: team.map(member => ({
        id: member._id,
        user: member.user_id,
        role: member.role,
        permissions: member.permissions,
        status: member.status,
        joined_at: member.joined_at
      })),
      stats: {
        // TODO: Implement actual metrics
        total_products: 0,
        active_bookings: 0,
        monthly_revenue: 0,
        pending_payouts: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get supplier dashboard error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}