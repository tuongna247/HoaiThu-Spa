import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { user, rating, comment } = await request.json();
    
    // Basic validation
    if (!user?.name || !user?.email || !rating || !comment) {
      return NextResponse.json({
        status: 400,
        msg: 'Name, email, rating, and comment are required'
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        status: 400,
        msg: 'Rating must be between 1 and 5'
      }, { status: 400 });
    }
    
    const tour = await Tour.findOne({ _id: params.id, isActive: true });
    if (!tour) {
      return NextResponse.json({
        status: 404,
        msg: 'Tour not found'
      }, { status: 404 });
    }

    const newReview = {
      user,
      rating: parseInt(rating),
      comment,
      date: new Date()
    };

    tour.reviews.push(newReview);
    
    // Update rating average
    const totalRating = tour.reviews.reduce((sum, review) => sum + review.rating, 0);
    tour.rating.average = totalRating / tour.reviews.length;
    tour.rating.count = tour.reviews.length;

    await tour.save();

    return NextResponse.json({
      status: 201,
      data: newReview,
      msg: 'Review added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Add review error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Failed to add review',
      error: error.message
    }, { status: 500 });
  }
}