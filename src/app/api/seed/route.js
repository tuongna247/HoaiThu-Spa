import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Country from '@/models/Country';
import City from '@/models/City';
import Category from '@/models/Category';
import Supplier from '@/models/Supplier';
import SupplierUser from '@/models/SupplierUser';

export async function POST(request) {
  try {
    await connectDB();
    
    const results = [];

    // 1. Create Countries
    const countriesData = [
      {
        name: 'Vietnam',
        code: 'VN',
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi'
      },
      {
        name: 'Thailand',
        code: 'TH',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
        locale: 'th'
      },
      {
        name: 'Singapore',
        code: 'SG',
        currency: 'SGD',
        timezone: 'Asia/Singapore',
        locale: 'en'
      }
    ];

    const countries = {};
    for (const countryData of countriesData) {
      try {
        const country = await Country.findOneAndUpdate(
          { code: countryData.code },
          countryData,
          { upsert: true, new: true }
        );
        countries[countryData.code] = country;
        results.push(`✅ Country: ${countryData.name}`);
      } catch (error) {
        results.push(`❌ Country ${countryData.name}: ${error.message}`);
      }
    }

    // 2. Create Cities
    const citiesData = [
      {
        name: 'Ho Chi Minh City',
        slug: 'ho-chi-minh-city',
        country_id: countries['VN']?._id,
        coordinates: { lat: 10.8231, lng: 106.6297 },
        timezone: 'Asia/Ho_Chi_Minh',
        is_popular: true
      },
      {
        name: 'Bangkok',
        slug: 'bangkok',
        country_id: countries['TH']?._id,
        coordinates: { lat: 13.7563, lng: 100.5018 },
        timezone: 'Asia/Bangkok',
        is_popular: true
      },
      {
        name: 'Singapore',
        slug: 'singapore',
        country_id: countries['SG']?._id,
        coordinates: { lat: 1.3521, lng: 103.8198 },
        timezone: 'Asia/Singapore',
        is_popular: true
      }
    ];

    for (const cityData of citiesData) {
      try {
        await City.findOneAndUpdate(
          { slug: cityData.slug },
          cityData,
          { upsert: true, new: true }
        );
        results.push(`✅ City: ${cityData.name}`);
      } catch (error) {
        results.push(`❌ City ${cityData.name}: ${error.message}`);
      }
    }

    // 3. Create Categories
    const categoriesData = [
      {
        name: 'Cultural Tours',
        slug: 'cultural-tours',
        icon: 'culture',
        color: '#e74c3c'
      },
      {
        name: 'Adventure',
        slug: 'adventure',
        icon: 'adventure',
        color: '#e67e22'
      },
      {
        name: 'Food & Drink',
        slug: 'food-drink',
        icon: 'food',
        color: '#f39c12'
      }
    ];

    for (const categoryData of categoriesData) {
      try {
        await Category.findOneAndUpdate(
          { slug: categoryData.slug },
          categoryData,
          { upsert: true, new: true }
        );
        results.push(`✅ Category: ${categoryData.name}`);
      } catch (error) {
        results.push(`❌ Category ${categoryData.name}: ${error.message}`);
      }
    }

    // 4. Create Users
    const usersData = [
      {
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@leetour.com',
        password: 'admin123',
        phone: '+1234567890',
        role: 'admin',
        country_id: countries['VN']?._id,
        permissions: ['system_admin'],
        isEmailVerified: true
      },
      {
        username: 'vietnam_admin',
        name: 'Vietnam Admin',
        email: 'vietnam.admin@leetour.com',
        password: 'admin123',
        role: 'country_admin',
        country_id: countries['VN']?._id,
        permissions: ['manage_users', 'approve_suppliers'],
        isEmailVerified: true
      },
      {
        username: 'supplier_owner',
        name: 'Tour Company Owner',
        email: 'owner@saigontours.com',
        password: 'supplier123',
        phone: '+84901234567',
        role: 'supplier',
        country_id: countries['VN']?._id,
        isEmailVerified: true
      },
      {
        username: 'accountant',
        name: 'Finance Manager',
        email: 'finance@leetour.com',
        password: 'finance123',
        role: 'accountant',
        permissions: ['manage_finances', 'view_analytics'],
        isEmailVerified: true
      }
    ];

    const createdUsers = {};
    for (const userData of usersData) {
      try {
        const existingUser = await User.findOne({ 
          $or: [{ email: userData.email }, { username: userData.username }]
        });

        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          createdUsers[userData.username] = user;
          results.push(`✅ User: ${userData.name}`);
        } else {
          createdUsers[userData.username] = existingUser;
          results.push(`ℹ️ User exists: ${userData.name}`);
        }
      } catch (error) {
        results.push(`❌ User ${userData.name}: ${error.message}`);
      }
    }

    // 5. Create Supplier Profile
    if (createdUsers['supplier_owner']) {
      try {
        const existingSupplier = await Supplier.findOne({
          user_id_owner: createdUsers['supplier_owner']._id
        });

        if (!existingSupplier) {
          const supplier = new Supplier({
            user_id_owner: createdUsers['supplier_owner']._id,
            company_info: {
              name: 'Saigon Adventure Tours',
              description: 'Premium tour operator specializing in authentic Vietnamese experiences',
              website: 'https://saigontours.com',
              address: {
                street: '123 Nguyen Hue Street',
                city: 'Ho Chi Minh City',
                country_id: countries['VN']?._id,
                postal_code: '700000'
              },
              contact: {
                phone: '+84901234567',
                email: 'contact@saigontours.com'
              },
              registration: {
                business_license: 'BL-123456789',
                tax_id: 'TAX-987654321',
                registration_date: new Date('2020-01-15')
              }
            },
            KYC_status: 'submitted',
            bank_info: {
              account_name: 'Saigon Adventure Tours Co Ltd',
              account_number: '1234567890',
              bank_name: 'Vietcombank',
              branch: 'District 1 Branch',
              currency: 'VND'
            },
            status: 'pending_approval'
          });

          await supplier.save();

          // Create SupplierUser relationship
          const supplierUser = new SupplierUser({
            supplier_id: supplier._id,
            user_id: createdUsers['supplier_owner']._id,
            role: 'owner',
            permissions: [
              'manage_products', 'manage_bookings', 'manage_schedules',
              'view_analytics', 'manage_team', 'view_finances'
            ],
            status: 'active',
            joined_at: new Date()
          });

          await supplierUser.save();
          results.push(`✅ Supplier: Saigon Adventure Tours`);
        } else {
          results.push(`ℹ️ Supplier exists: Saigon Adventure Tours`);
        }
      } catch (error) {
        results.push(`❌ Supplier: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      results
    });

  } catch (error) {
    console.error('Seed data error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create seed data',
      error: error.message
    }, { status: 500 });
  }
}