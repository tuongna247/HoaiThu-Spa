import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SupplierUser from '@/models/SupplierUser';

// GET /api/v1/users/me - Get current user profile
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

    // Get detailed user info
    const user = await User.findById(authResult.user.userId)
      .populate('country_id', 'name code currency')
      .select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Get supplier roles if user has any
    let supplierRoles = [];
    if (['supplier', 'supervisor'].includes(user.role)) {
      supplierRoles = await SupplierUser.getUserSupplierRoles(user._id);
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          locale: user.locale,
          country: user.country_id,
          permissions: user.permissions,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        supplierRoles
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}

// PUT /api/v1/users/me - Update current user profile
export async function PUT(request) {
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

    const { name, phone, locale, country_id, profilePicture } = await request.json();

    // Update user profile
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (locale) updateData.locale = locale;
    if (country_id) updateData.country_id = country_id;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      authResult.user.userId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('country_id', 'name code currency')
    .select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          locale: user.locale,
          country: user.country_id,
          permissions: user.permissions,
          profilePicture: user.profilePicture
        }
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}