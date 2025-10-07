import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // In a client-side logout, the token is removed from localStorage/cookies
    // This endpoint exists for consistency with the original backend API
    
    return NextResponse.json({
      status: 200,
      msg: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}