import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { role } = await request.json();

    if (!role || !['admin', 'mod', 'customer'].includes(role)) {
      return NextResponse.json({
        status: 400,
        msg: 'Invalid role provided'
      }, { status: 400 });
    }

    // Create test user data based on role
    const testUsers = {
      admin: {
        _id: 'test-admin-id',
        name: 'Test Admin',
        email: 'admin@test.com',
        username: 'testadmin',
        role: 'admin',
        isActive: true,
        provider: 'local'
      },
      mod: {
        _id: 'test-mod-id',
        name: 'Test Moderator',
        email: 'mod@test.com',
        username: 'testmod',
        role: 'mod',
        isActive: true,
        provider: 'local'
      },
      customer: {
        _id: 'test-customer-id',
        name: 'Test Customer',
        email: 'customer@test.com',
        username: 'testcustomer',
        role: 'customer',
        isActive: true,
        provider: 'local'
      }
    };

    const user = testUsers[role];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      status: 200,
      msg: `Test ${role} login successful`,
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Test login failed',
      error: error.message
    }, { status: 500 });
  }
}