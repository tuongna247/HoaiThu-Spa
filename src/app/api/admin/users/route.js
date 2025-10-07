import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all users (Admin only)
export async function GET(request) {
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

    // Fetch all users with selected fields
    const users = await User.find({}, {
      password: 0 // Exclude password from response
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      status: 200,
      msg: 'Users fetched successfully',
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Create new user (Admin only)
export async function POST(request) {
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

    const { 
      name, 
      username, 
      email, 
      phone,
      password, 
      role = 'customer', 
      locale = 'en',
      country_id,
      isActive = true,
      permissions = []
    } = await request.json()

    // Validation
    if (!name || !username || !email || !password) {
      return NextResponse.json({
        status: 400,
        msg: 'All fields are required'
      }, { status: 400 })
    }

    const validRoles = ['admin', 'country_admin', 'supplier', 'supervisor', 'accountant', 'mod', 'customer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        status: 400,
        msg: 'Invalid role specified'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        status: 400,
        msg: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return NextResponse.json({
        status: 400,
        msg: 'User already exists with this email or username'
      }, { status: 400 })
    }

    // Create new user
    const userData = {
      name: name.trim(),
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role,
      locale,
      isActive,
      provider: 'local',
      permissions
    };

    // Add optional fields
    if (phone) userData.phone = phone;
    if (country_id) userData.country_id = country_id;

    const newUser = new User(userData)

    await newUser.save()

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      provider: newUser.provider,
      createdAt: newUser.createdAt
    }

    return NextResponse.json({
      status: 201,
      msg: 'User created successfully',
      data: userResponse
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}