import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import { hasPermission, PERMISSIONS } from '@/lib/roles';

// POST /api/v1/admin/suppliers/:id/approve - Approve supplier
export async function POST(request, { params }) {
  try {
    await connectDB();
    
    // Verify authentication and admin permissions
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user has supplier approval permissions
    if (!hasPermission(authResult.user, PERMISSIONS.APPROVE_SUPPLIERS)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const supplierId = params.id;
    const { approved = true, notes = '' } = await request.json();

    // Find supplier
    const supplier = await Supplier.findById(supplierId)
      .populate('user_id_owner', 'name email');

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: 'Supplier not found'
      }, { status: 404 });
    }

    // Update supplier status
    const updateData = {
      approved_by: authResult.user.userId,
      approved_at: new Date()
    };

    if (approved) {
      updateData.status = 'active';
      if (supplier.KYC_status === 'submitted') {
        updateData.KYC_status = 'approved';
      }
    } else {
      updateData.status = 'suspended';
      updateData.KYC_status = 'rejected';
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      updateData,
      { new: true }
    ).populate('user_id_owner', 'name email')
     .populate('approved_by', 'name email');

    // TODO: Send notification email to supplier

    return NextResponse.json({
      success: true,
      message: `Supplier ${approved ? 'approved' : 'rejected'} successfully`,
      data: {
        supplier: {
          id: updatedSupplier._id,
          company: updatedSupplier.company_info,
          status: updatedSupplier.status,
          kyc_status: updatedSupplier.KYC_status,
          approved_at: updatedSupplier.approved_at,
          approved_by: updatedSupplier.approved_by
        }
      }
    });

  } catch (error) {
    console.error('Approve supplier error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}

// GET /api/v1/admin/suppliers/:id/approve - Get supplier approval details
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Verify authentication and admin permissions
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    if (!hasPermission(authResult.user, PERMISSIONS.APPROVE_SUPPLIERS)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const supplierId = params.id;

    const supplier = await Supplier.findById(supplierId)
      .populate('user_id_owner', 'name email phone createdAt')
      .populate('approved_by', 'name email')
      .populate('company_info.address.country_id', 'name code');

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: 'Supplier not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        supplier: {
          id: supplier._id,
          owner: supplier.user_id_owner,
          company: supplier.company_info,
          kyc_status: supplier.KYC_status,
          kyc_documents: supplier.KYC_documents,
          bank_info: {
            account_name: supplier.bank_info?.account_name,
            bank_name: supplier.bank_info?.bank_name,
            // Hide sensitive info
            account_number: supplier.bank_info?.account_number ? 
              '****' + supplier.bank_info.account_number.slice(-4) : null
          },
          status: supplier.status,
          commission_rate: supplier.commission_rate,
          approved_at: supplier.approved_at,
          approved_by: supplier.approved_by,
          created_at: supplier.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get supplier approval details error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}