import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { 
      username, 
      name, 
      email, 
      phone,
      password, 
      locale = 'en',
      country_id 
    } = await request.json();

    // Basic validation
    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json({
        success: false,
        message: 'Username must be between 3 and 30 characters'
      }, { status: 400 });
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Please provide a valid email address'
      }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Full name is required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json({
        success: false,
        message: `User already exists with this ${field}`
      }, { status: 409 });
    }

    // Create new user (role defaults to 'customer')
    const userData = {
      username: username.toLowerCase(),
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'customer',
      locale,
      provider: 'local'
    };

    // Add optional fields
    if (phone) userData.phone = phone;
    if (country_id) userData.country_id = country_id;

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
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
          permissions: user.permissions
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('V1 Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}