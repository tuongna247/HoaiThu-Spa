import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({
        status: 400,
        msg: 'Username and password are required'
      }, { status: 400 });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!user) {
      return NextResponse.json({
        status: 401,
        msg: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json({
        status: 401,
        msg: 'Invalid credentials'
      }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      userId: user._id,
      username: user.username,
      role: user.role
    };

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: '24h'
    });

    return NextResponse.json({
      status: 200,
      msg: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('=== Login error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        stack: error.stack
      } : undefined
    }, { status: 500 });
  }
}