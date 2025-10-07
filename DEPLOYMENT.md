# 🚀 LeeTour Deployment Guide

## Prerequisites
- MongoDB Atlas account (free)
- Vercel account (free)
- Git repository

## Step-by-Step Deployment

### 1. MongoDB Atlas Setup
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/leetour`
3. Whitelist all IPs: `0.0.0.0/0`

### 2. Vercel Deployment
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import this repository
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random secret key for JWT tokens
   - `NODE_ENV`: production

### 3. Environment Variables
Set these in Vercel dashboard:
```
MONGODB_URI=mongodb+srv://leetour:YOUR_PASSWORD@leetour-cluster.xxxxx.mongodb.net/leetour
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
NODE_ENV=production
```

### 4. Test Accounts
After deployment, you can create test users or use these defaults:
- Admin: username=`admin`, password=`admin123`
- User: username=`user`, password=`user123`

## Features
✅ Tour Management System
✅ User Authentication (JWT)
✅ Admin Dashboard
✅ Responsive Design
✅ MongoDB Database
✅ API Routes

## Support
- Frontend: Next.js 15
- Database: MongoDB Atlas
- Hosting: Vercel
- Authentication: JWT + Custom Auth