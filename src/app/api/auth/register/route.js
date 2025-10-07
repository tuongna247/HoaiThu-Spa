import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { username, name, email, password, role = 'user' } = await request.json();

    // Basic validation
    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json({
        status: 400,
        msg: 'Username must be between 3 and 30 characters'
      }, { status: 400 });
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({
        status: 400,
        msg: 'Please provide a valid email'
      }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({
        status: 400,
        msg: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({
        status: 400,
        msg: 'Name is required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json({
        status: 400,
        msg: 'User already exists with this email or username'
      }, { status: 400 });
    }

    // Create new user
    const user = new User({
      username,
      name: name.trim(),
      email,
      password,
      role
    });

    await user.save();

    // Generate JWT token
    const payload = {
      userId: user._id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h'
    });

    return NextResponse.json({
      status: 201,
      msg: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}