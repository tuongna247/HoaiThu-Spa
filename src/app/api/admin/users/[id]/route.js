import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET - Fetch single user (Admin only)
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    // Verify admin authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({
        status: 401,
        msg: 'Unauthorized'
      }, { status: 401 })
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({
        status: 403,
        msg: 'Access denied. Admin privileges required.'
      }, { status: 403 })
    }

    const { id } = params

    const user = await User.findById(id, {
      password: 0 // Exclude password
    })

    if (!user) {
      return NextResponse.json({
        status: 404,
        msg: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      status: 200,
      msg: 'User fetched successfully',
      data: user
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update user (Admin only)
export async function PUT(request, { params }) {
  try {
    await connectDB()
    
    // Verify admin authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({
        status: 401,
        msg: 'Unauthorized'
      }, { status: 401 })
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({
        status: 403,
        msg: 'Access denied. Admin privileges required.'
      }, { status: 403 })
    }

    const { id } = params
    const updateData = await request.json()

    // Find the user
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({
        status: 404,
        msg: 'User not found'
      }, { status: 404 })
    }

    // Validate role if provided
    if (updateData.role && !['admin', 'mod', 'customer'].includes(updateData.role)) {
      return NextResponse.json({
        status: 400,
        msg: 'Invalid role specified'
      }, { status: 400 })
    }

    // Validate email uniqueness if email is being changed
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email })
      if (existingUser) {
        return NextResponse.json({
          status: 400,
          msg: 'Email already exists'
        }, { status: 400 })
      }
    }

    // Validate username uniqueness if username is being changed
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({ username: updateData.username })
      if (existingUser) {
        return NextResponse.json({
          status: 400,
          msg: 'Username already exists'
        }, { status: 400 })
      }
    }

    // Validate password if provided
    if (updateData.password && updateData.password.length < 6) {
      return NextResponse.json({
        status: 400,
        msg: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Prepare update object
    const allowedFields = ['name', 'username', 'email', 'role', 'isActive']
    const updateFields = {}

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field]
      }
    })

    // Handle password separately (only if provided and not empty)
    if (updateData.password && updateData.password.trim() !== '') {
      updateFields.password = updateData.password
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, select: '-password' } // Return updated document without password
    )

    return NextResponse.json({
      status: 200,
      msg: 'User updated successfully',
      data: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    
    // Verify admin authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({
        status: 401,
        msg: 'Unauthorized'
      }, { status: 401 })
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({
        status: 403,
        msg: 'Access denied. Admin privileges required.'
      }, { status: 403 })
    }

    const { id } = params

    // Prevent admin from deleting themselves
    if (id === authResult.user.userId) {
      return NextResponse.json({
        status: 400,
        msg: 'Cannot delete your own account'
      }, { status: 400 })
    }

    const deletedUser = await User.findByIdAndDelete(id)
    
    if (!deletedUser) {
      return NextResponse.json({
        status: 404,
        msg: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      status: 200,
      msg: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}