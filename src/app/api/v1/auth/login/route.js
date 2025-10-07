import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { username, email, password } = await request.json();
    
    // Support login with either username or email
    const loginField = username || email;
    
    if (!loginField || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username/email and password are required'
      }, { status: 400 });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: loginField }, { email: loginField }],
      isActive: true
    }).populate('country_id', 'name code currency');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d' // 7 days for better UX
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
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
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('V1 Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}