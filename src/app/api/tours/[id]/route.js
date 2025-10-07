import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const tour = await Tour.findOne({ _id: params.id, isActive: true });
    
    if (!tour) {
      return NextResponse.json({
        status: 404,
        msg: 'Tour not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      data: tour,
      msg: 'success'
    });

  } catch (error) {
    console.error('Get tour error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Failed to fetch tour',
      error: error.message
    }, { status: 500 });
  }
}