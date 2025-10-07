import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        status: 401,
        msg: 'No token, authorization denied'
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return NextResponse.json({
        status: 401,
        msg: 'Token is not valid'
      }, { status: 401 });
    }

    return NextResponse.json({
      status: 200,
      msg: 'User retrieved successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json({
      status: 401,
      msg: 'Token is not valid'
    }, { status: 401 });
  }
}