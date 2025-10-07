import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaService from '@/models/SpaService';
import { verifyToken } from '@/lib/auth';

// GET - Get service details
export async function GET(request, { params }) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const service = await SpaService.findById(id);

    if (!service) {
      return NextResponse.json({
        status: 404,
        msg: 'Service not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      msg: 'Service retrieved successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Get service error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update service
export async function PUT(request, { params }) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    const service = await SpaService.findById(id);

    if (!service) {
      return NextResponse.json({
        status: 404,
        msg: 'Service not found'
      }, { status: 404 });
    }

    // Check if name is being changed and if it's unique
    if (body.name && body.name !== service.name) {
      const existingName = await SpaService.findOne({
        name: body.name,
        _id: { $ne: id }
      });

      if (existingName) {
        return NextResponse.json({
          status: 400,
          msg: 'Service name already exists'
        }, { status: 400 });
      }
    }

    // Update service
    const updatedService = await SpaService.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      status: 200,
      msg: 'Service updated successfully',
      data: { service: updatedService }
    });

  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete service (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { success, user } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    const service = await SpaService.findById(id);

    if (!service) {
      return NextResponse.json({
        status: 404,
        msg: 'Service not found'
      }, { status: 404 });
    }

    // Soft delete
    service.isActive = false;
    await service.save();

    return NextResponse.json({
      status: 200,
      msg: 'Service deleted successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
