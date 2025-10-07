import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomer from '@/models/SpaCustomer';
import SpaService from '@/models/SpaService';
import SpaPromotion from '@/models/SpaPromotion';
import SpaServicePromotion from '@/models/SpaServicePromotion';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import SpaServiceUsage from '@/models/SpaServiceUsage';
import { verifyToken } from '@/lib/auth';

// GET - Get dashboard statistics
export async function GET(request) {
  try {
    const { success } = await verifyToken(request);

    if (!success) {
      return NextResponse.json({
        status: 401,
        msg: 'Authentication required'
      }, { status: 401 });
    }

    await connectDB();

    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Total customers
    const totalCustomers = await SpaCustomer.countDocuments({ isActive: true });

    // 2. Customers with remaining services
    const activePurchases = await SpaCustomerPurchase.find({
      status: 'active',
      timesRemaining: { $gt: 0 }
    }).populate('customerId').lean();

    // Group by customer
    const customersWithRemaining = {};
    activePurchases.forEach(purchase => {
      const customerId = purchase.customerId._id.toString();
      if (!customersWithRemaining[customerId]) {
        customersWithRemaining[customerId] = {
          customer: purchase.customerId,
          totalRemaining: 0,
          packages: []
        };
      }
      customersWithRemaining[customerId].totalRemaining += purchase.timesRemaining;
      customersWithRemaining[customerId].packages.push({
        purchaseId: purchase._id,
        servicePromotionId: purchase.servicePromotionId,
        timesRemaining: purchase.timesRemaining,
        paymentDate: purchase.paymentDate
      });
    });

    const customersWithRemainingArray = Object.values(customersWithRemaining)
      .sort((a, b) => b.totalRemaining - a.totalRemaining);

    // 3. Total active packages
    const totalActivePackages = await SpaCustomerPurchase.countDocuments({
      status: 'active',
      timesRemaining: { $gt: 0 }
    });

    // 4. Total revenue (all time, this month)
    const allPurchases = await SpaCustomerPurchase.find({});
    const totalRevenue = allPurchases.reduce((sum, p) => sum + p.paymentAmount, 0);

    const thisMonthPurchases = await SpaCustomerPurchase.find({
      paymentDate: { $gte: thisMonthStart }
    });
    const thisMonthRevenue = thisMonthPurchases.reduce((sum, p) => sum + p.paymentAmount, 0);

    // 5. Services used (today, this week, this month)
    const usageToday = await SpaServiceUsage.countDocuments({
      usingDateTime: { $gte: today }
    });

    const usageThisWeek = await SpaServiceUsage.countDocuments({
      usingDateTime: { $gte: thisWeekStart }
    });

    const usageThisMonth = await SpaServiceUsage.countDocuments({
      usingDateTime: { $gte: thisMonthStart }
    });

    // 6. Top services (by usage count)
    const usageByService = await SpaServiceUsage.aggregate([
      {
        $lookup: {
          from: 'spacustomerpurchases',
          localField: 'customerPurchaseId',
          foreignField: '_id',
          as: 'purchase'
        }
      },
      { $unwind: '$purchase' },
      {
        $lookup: {
          from: 'spaservicepromotions',
          localField: 'purchase.servicePromotionId',
          foreignField: '_id',
          as: 'servicePromotion'
        }
      },
      { $unwind: '$servicePromotion' },
      {
        $group: {
          _id: '$servicePromotion.serviceId',
          serviceName: { $first: '$servicePromotion.serviceName' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 7. Recent activities (last 10 usage records)
    const recentActivities = await SpaServiceUsage.find({})
      .populate('customerId')
      .populate({
        path: 'customerPurchaseId',
        populate: {
          path: 'servicePromotionId',
          populate: { path: 'serviceId' }
        }
      })
      .sort({ usingDateTime: -1 })
      .limit(10)
      .lean();

    // 8. Services expiring soon (within 30 days or less than 2 uses remaining)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await SpaCustomerPurchase.find({
      status: 'active',
      $or: [
        { expiryDate: { $lte: thirtyDaysFromNow, $ne: null } },
        { timesRemaining: { $lte: 2, $gt: 0 } }
      ]
    }).populate('customerId')
      .populate({
        path: 'servicePromotionId',
        populate: { path: 'serviceId' }
      })
      .limit(10)
      .lean();

    // 9. Count all entities
    const totalServices = await SpaService.countDocuments({ isActive: true });
    const totalPromotions = await SpaPromotion.countDocuments({ isActive: true });
    const totalServicePromotions = await SpaServicePromotion.countDocuments({ isActive: true });

    return NextResponse.json({
      status: 200,
      msg: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalCustomers,
          customersWithRemaining: customersWithRemainingArray.length,
          totalActivePackages,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100
        },
        counts: {
          services: totalServices,
          promotions: totalPromotions,
          servicePromotions: totalServicePromotions
        },
        usage: {
          today: usageToday,
          thisWeek: usageThisWeek,
          thisMonth: usageThisMonth
        },
        topServices: usageByService,
        customersWithRemaining: customersWithRemainingArray.slice(0, 20), // Top 20
        recentActivities,
        expiringSoon
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json({
      status: 500,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
