import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    // Create initial users for the system
    const initialUsers = [
      {
        username: 'admin',
        name: 'Administrator',
        email: 'admin@leetour.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      },
      {
        username: 'user',
        name: 'User Account',
        email: 'user@leetour.com', 
        password: 'user123',
        role: 'mod',
        isEmailVerified: true
      },
      {
        username: 'customer',
        name: 'Customer Account',
        email: 'customer@leetour.com',
        password: 'customer123',
        role: 'customer',
        isEmailVerified: true
      }
    ];

    const results = [];
    
    for (const userData of initialUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email: userData.email }, { username: userData.username }]
        });

        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          results.push(`✅ Created user: ${userData.username}`);
        } else {
          // Update existing user with missing fields
          if (!existingUser.name) {
            existingUser.name = userData.name;
            await existingUser.save();
            results.push(`✅ Updated user: ${userData.username}`);
          } else {
            results.push(`ℹ️ User already exists: ${userData.username}`);
          }
        }
      } catch (error) {
        results.push(`❌ Failed to create ${userData.username}: ${error.message}`);
      }
    }

    return NextResponse.json({
      status: 200,
      msg: 'Initial users setup completed',
      results
    });

  } catch (error) {
    console.error('Setup demo error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Failed to setup demo users',
      error: error.message
    }, { status: 500 });
  }
}