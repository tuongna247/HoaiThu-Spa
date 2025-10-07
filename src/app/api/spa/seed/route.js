import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SpaCustomer from '@/models/SpaCustomer';
import SpaService from '@/models/SpaService';
import SpaPromotion from '@/models/SpaPromotion';
import SpaServicePromotion from '@/models/SpaServicePromotion';
import SpaCustomerPurchase from '@/models/SpaCustomerPurchase';
import SpaServiceUsage from '@/models/SpaServiceUsage';

export async function POST(request) {
  try {
    await connectDB();

    const results = [];

    // 1. Create Services
    const servicesData = [
      {
        name: 'Swedish Massage',
        description: 'A gentle full-body massage that uses long strokes, kneading, and circular movements to help relax and energize you.',
        basePrice: 500000,
        duration: 60,
        category: 'massage'
      },
      {
        name: 'Deep Tissue Massage',
        description: 'A massage technique that focuses on the deeper layers of muscle tissue. It helps with chronic aches and pain.',
        basePrice: 650000,
        duration: 90,
        category: 'massage'
      },
      {
        name: 'Hot Stone Massage',
        description: 'A massage that uses smooth, heated stones placed on specific points on your body to warm and loosen tight muscles.',
        basePrice: 750000,
        duration: 75,
        category: 'massage'
      },
      {
        name: 'Hydrating Facial',
        description: 'Deep cleansing facial treatment with moisturizing serum to restore skin hydration and glow.',
        basePrice: 600000,
        duration: 60,
        category: 'facial'
      },
      {
        name: 'Anti-Aging Facial',
        description: 'Advanced facial treatment targeting fine lines and wrinkles with collagen boosting ingredients.',
        basePrice: 850000,
        duration: 75,
        category: 'facial'
      },
      {
        name: 'Body Scrub',
        description: 'Exfoliating treatment that removes dead skin cells, leaving skin smooth and refreshed.',
        basePrice: 450000,
        duration: 45,
        category: 'body_treatment'
      },
      {
        name: 'Aromatherapy Massage',
        description: 'Therapeutic massage using essential oils to promote relaxation and well-being.',
        basePrice: 700000,
        duration: 60,
        category: 'massage'
      },
      {
        name: 'Manicure & Pedicure',
        description: 'Complete nail care including shaping, cuticle care, polish, and hand/foot massage.',
        basePrice: 400000,
        duration: 90,
        category: 'nail_care'
      }
    ];

    const services = {};
    for (const serviceData of servicesData) {
      try {
        const existing = await SpaService.findOne({ name: serviceData.name });
        if (!existing) {
          const service = new SpaService(serviceData);
          await service.save();
          services[serviceData.name] = service;
          results.push(`✅ Service: ${serviceData.name}`);
        } else {
          services[serviceData.name] = existing;
          results.push(`ℹ️ Service exists: ${serviceData.name}`);
        }
      } catch (error) {
        results.push(`❌ Service ${serviceData.name}: ${error.message}`);
      }
    }

    // 2. Create Promotions
    const promotionsData = [
      {
        name: '5 Times Package',
        description: 'Buy 5 sessions and get 10% discount',
        reduceTimes: 5,
        discountPercentage: 10
      },
      {
        name: '10 Times Package',
        description: 'Buy 10 sessions and get 20% discount - Best Value!',
        reduceTimes: 10,
        discountPercentage: 20
      },
      {
        name: '20 Times Package',
        description: 'Buy 20 sessions and get 30% discount - Ultimate Package',
        reduceTimes: 20,
        discountPercentage: 30
      },
      {
        name: 'Single Session',
        description: 'Pay as you go - No discount',
        reduceTimes: 1,
        discountPercentage: 0
      }
    ];

    const promotions = {};
    for (const promoData of promotionsData) {
      try {
        const existing = await SpaPromotion.findOne({ name: promoData.name });
        if (!existing) {
          const promotion = new SpaPromotion(promoData);
          await promotion.save();
          promotions[promoData.name] = promotion;
          results.push(`✅ Promotion: ${promoData.name}`);
        } else {
          promotions[promoData.name] = existing;
          results.push(`ℹ️ Promotion exists: ${promoData.name}`);
        }
      } catch (error) {
        results.push(`❌ Promotion ${promoData.name}: ${error.message}`);
      }
    }

    // 3. Create Service Promotions (Packages)
    const servicePromotionsData = [
      { service: 'Swedish Massage', promotion: '10 Times Package' },
      { service: 'Swedish Massage', promotion: '5 Times Package' },
      { service: 'Deep Tissue Massage', promotion: '10 Times Package' },
      { service: 'Deep Tissue Massage', promotion: '5 Times Package' },
      { service: 'Hot Stone Massage', promotion: '10 Times Package' },
      { service: 'Hydrating Facial', promotion: '10 Times Package' },
      { service: 'Hydrating Facial', promotion: '5 Times Package' },
      { service: 'Anti-Aging Facial', promotion: '5 Times Package' },
      { service: 'Body Scrub', promotion: '20 Times Package' },
      { service: 'Aromatherapy Massage', promotion: '10 Times Package' },
      { service: 'Manicure & Pedicure', promotion: '10 Times Package' }
    ];

    const servicePromotions = {};
    for (const spData of servicePromotionsData) {
      try {
        const service = services[spData.service];
        const promotion = promotions[spData.promotion];

        if (!service || !promotion) continue;

        const existing = await SpaServicePromotion.findOne({
          serviceId: service._id,
          promotionId: promotion._id
        });

        if (!existing) {
          // Calculate final price
          let finalPrice = service.basePrice;
          if (promotion.discountPercentage > 0) {
            finalPrice = finalPrice * (1 - promotion.discountPercentage / 100);
          }

          const sp = new SpaServicePromotion({
            serviceId: service._id,
            serviceName: service.name,
            promotionId: promotion._id,
            promotionName: promotion.name,
            finalPrice: Math.round(finalPrice * 100) / 100,
            timesIncluded: promotion.reduceTimes
          });

          await sp.save();
          servicePromotions[`${spData.service}-${spData.promotion}`] = sp;
          results.push(`✅ Package: ${service.name} - ${promotion.name}`);
        } else {
          servicePromotions[`${spData.service}-${spData.promotion}`] = existing;
          results.push(`ℹ️ Package exists: ${service.name} - ${promotion.name}`);
        }
      } catch (error) {
        results.push(`❌ Package ${spData.service} - ${spData.promotion}: ${error.message}`);
      }
    }

    // 4. Create Sample Customers
    const customersData = [
      {
        firstName: 'Nguyễn',
        middleName: 'Thị',
        lastName: 'Lan',
        email: 'lan.nguyen@example.com',
        phoneNumber: '+84901234567',
        dateOfBirth: new Date('1985-05-15'),
        address: {
          street: '123 Lê Lợi',
          city: 'TP. Hồ Chí Minh',
          country: 'Vietnam'
        }
      },
      {
        firstName: 'Trần',
        middleName: 'Văn',
        lastName: 'Minh',
        email: 'minh.tran@example.com',
        phoneNumber: '+84902345678',
        dateOfBirth: new Date('1990-08-20'),
        address: {
          street: '456 Nguyễn Huệ',
          city: 'TP. Hồ Chí Minh',
          country: 'Vietnam'
        }
      },
      {
        firstName: 'Lê',
        middleName: 'Thị',
        lastName: 'Hoa',
        email: 'hoa.le@example.com',
        phoneNumber: '+84903456789',
        dateOfBirth: new Date('1992-03-10'),
        address: {
          street: '789 Hai Bà Trưng',
          city: 'TP. Hồ Chí Minh',
          country: 'Vietnam'
        }
      },
      {
        firstName: 'Phạm',
        lastName: 'Anh',
        email: 'anh.pham@example.com',
        phoneNumber: '+84904567890',
        dateOfBirth: new Date('1988-11-25'),
        address: {
          street: '321 Trần Hưng Đạo',
          city: 'TP. Hồ Chí Minh',
          country: 'Vietnam'
        }
      },
      {
        firstName: 'Hoàng',
        middleName: 'Văn',
        lastName: 'Tùng',
        email: 'tung.hoang@example.com',
        phoneNumber: '+84905678901',
        dateOfBirth: new Date('1995-07-08'),
        address: {
          street: '654 Điện Biên Phủ',
          city: 'TP. Hồ Chí Minh',
          country: 'Vietnam'
        }
      }
    ];

    const customers = {};
    for (const customerData of customersData) {
      try {
        const existing = await SpaCustomer.findOne({ phoneNumber: customerData.phoneNumber });
        if (!existing) {
          const customer = new SpaCustomer(customerData);
          await customer.save();
          customers[customerData.phoneNumber] = customer;
          results.push(`✅ Customer: ${customer.fullName}`);
        } else {
          customers[customerData.phoneNumber] = existing;
          results.push(`ℹ️ Customer exists: ${existing.fullName}`);
        }
      } catch (error) {
        results.push(`❌ Customer: ${error.message}`);
      }
    }

    // 5. Create Sample Purchases
    const customerArray = Object.values(customers);
    const spArray = Object.values(servicePromotions);

    if (customerArray.length > 0 && spArray.length > 0) {
      // Customer 1: Swedish Massage 10 times - 7 remaining
      const customer1 = customerArray[0];
      const sp1 = spArray.find(sp => sp.serviceName === 'Swedish Massage' && sp.promotionName === '10 Times Package');

      if (sp1) {
        const existing1 = await SpaCustomerPurchase.findOne({
          customerId: customer1._id,
          servicePromotionId: sp1._id
        });

        if (!existing1) {
          const purchase1 = new SpaCustomerPurchase({
            customerId: customer1._id,
            servicePromotionId: sp1._id,
            paymentAmount: sp1.finalPrice * sp1.timesIncluded,
            paymentMethod: 'card',
            paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            totalTimesIncluded: sp1.timesIncluded,
            timesUsed: 3,
            timesRemaining: 7,
            status: 'active'
          });
          await purchase1.save();
          results.push(`✅ Purchase: ${customer1.fullName} - ${sp1.serviceName}`);

          // Add 3 usage records
          for (let i = 0; i < 3; i++) {
            const usage = new SpaServiceUsage({
              customerPurchaseId: purchase1._id,
              customerId: customer1._id,
              usingDateTime: new Date(Date.now() - (25 - i * 7) * 24 * 60 * 60 * 1000),
              remainingAfterUse: 7 + (2 - i),
              staffMember: 'Alice',
              note: 'Service completed successfully',
              rating: 5
            });
            await usage.save();
          }
        }
      }

      // Customer 2: Hydrating Facial 10 times - 8 remaining
      const customer2 = customerArray[1];
      const sp2 = spArray.find(sp => sp.serviceName === 'Hydrating Facial' && sp.promotionName === '10 Times Package');

      if (sp2) {
        const existing2 = await SpaCustomerPurchase.findOne({
          customerId: customer2._id,
          servicePromotionId: sp2._id
        });

        if (!existing2) {
          const purchase2 = new SpaCustomerPurchase({
            customerId: customer2._id,
            servicePromotionId: sp2._id,
            paymentAmount: sp2.finalPrice * sp2.timesIncluded,
            paymentMethod: 'cash',
            paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            totalTimesIncluded: sp2.timesIncluded,
            timesUsed: 2,
            timesRemaining: 8,
            status: 'active'
          });
          await purchase2.save();
          results.push(`✅ Purchase: ${customer2.fullName} - ${sp2.serviceName}`);

          // Add 2 usage records
          for (let i = 0; i < 2; i++) {
            const usage = new SpaServiceUsage({
              customerPurchaseId: purchase2._id,
              customerId: customer2._id,
              usingDateTime: new Date(Date.now() - (15 - i * 7) * 24 * 60 * 60 * 1000),
              remainingAfterUse: 8 + (1 - i),
              staffMember: 'Bob',
              note: 'Customer very satisfied'
            });
            await usage.save();
          }
        }
      }

      // Customer 3: Multiple purchases
      const customer3 = customerArray[2];
      const sp3a = spArray.find(sp => sp.serviceName === 'Deep Tissue Massage' && sp.promotionName === '5 Times Package');
      const sp3b = spArray.find(sp => sp.serviceName === 'Body Scrub' && sp.promotionName === '20 Times Package');

      if (sp3a) {
        const existing3a = await SpaCustomerPurchase.findOne({
          customerId: customer3._id,
          servicePromotionId: sp3a._id
        });

        if (!existing3a) {
          const purchase3a = new SpaCustomerPurchase({
            customerId: customer3._id,
            servicePromotionId: sp3a._id,
            paymentAmount: sp3a.finalPrice * sp3a.timesIncluded,
            paymentMethod: 'transfer',
            paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            totalTimesIncluded: sp3a.timesIncluded,
            timesUsed: 1,
            timesRemaining: 4,
            status: 'active'
          });
          await purchase3a.save();
          results.push(`✅ Purchase: ${customer3.fullName} - ${sp3a.serviceName}`);
        }
      }

      if (sp3b) {
        const existing3b = await SpaCustomerPurchase.findOne({
          customerId: customer3._id,
          servicePromotionId: sp3b._id
        });

        if (!existing3b) {
          const purchase3b = new SpaCustomerPurchase({
            customerId: customer3._id,
            servicePromotionId: sp3b._id,
            paymentAmount: sp3b.finalPrice * sp3b.timesIncluded,
            paymentMethod: 'card',
            paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            totalTimesIncluded: sp3b.timesIncluded,
            timesUsed: 5,
            timesRemaining: 15,
            status: 'active'
          });
          await purchase3b.save();
          results.push(`✅ Purchase: ${customer3.fullName} - ${sp3b.serviceName}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Spa seed data created successfully',
      results
    });

  } catch (error) {
    console.error('Spa seed error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create spa seed data',
      error: error.message
    }, { status: 500 });
  }
}
