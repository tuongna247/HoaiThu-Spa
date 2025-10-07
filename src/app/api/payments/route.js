import { NextResponse } from "next/server";

// Mock data for demo purposes
const mockPayments = [
  {
    _id: "1",
    amount: { total: 199, currency: "USD" },
    transaction: { status: "completed", id: "txn_123" },
    customer: { email: "john@example.com" },
    createdAt: new Date()
  }
];

// GET all payments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    
    let filteredPayments = mockPayments;
    if (status) filteredPayments = filteredPayments.filter(p => p.transaction.status === status);
    if (email) filteredPayments = filteredPayments.filter(p => p.customer.email === email);
    
    return NextResponse.json({
      status: 200,
      data: {
        payments: filteredPayments,
        pagination: {
          page,
          limit,
          total: filteredPayments.length,
          pages: Math.ceil(filteredPayments.length / limit)
        }
      },
      msg: "success"
    });
  } catch (error) {
    return NextResponse.json({
      status: 400,
      msg: "something went wrong",
      error: error.message
    });
  }
}

// POST - Process payment
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate
    
    const newPayment = {
      _id: Date.now().toString(),
      bookingId: data.bookingId,
      amount: data.amount || { total: 199, currency: "USD" },
      paymentMethod: data.paymentMethod,
      customer: data.customer,
      transaction: {
        status: success ? 'completed' : 'failed',
        id: success ? `txn_${Date.now()}` : null,
        processedAt: new Date()
      },
      createdAt: new Date()
    };
    
    mockPayments.push(newPayment);
    
    return NextResponse.json({
      status: success ? 201 : 400,
      data: newPayment,
      msg: success ? "Payment processed successfully" : "Payment failed"
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 400,
      msg: "something went wrong",
      error: error.message
    });
  }
}