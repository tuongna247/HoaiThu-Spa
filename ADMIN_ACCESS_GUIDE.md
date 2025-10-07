# Admin Access Guide

This guide explains how to access and use the admin panel in your application.

## Quick Start - Access Admin Panel

### Step 1: Start MongoDB
```bash
docker-compose up -d
```

### Step 2: Seed Database (Create Admin User)
Make a POST request to create initial data including the admin user:

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/seed
```

**Using browser:** Navigate to http://localhost:3001/api/seed (POST request via browser extension or API tool)

**Using PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/seed" -Method POST
```

### Step 3: Login with Admin Credentials
- **URL**: http://localhost:3001/auth/auth1/login
- **Username**: `admin` or `admin@leetour.com`
- **Password**: `admin123`

### Step 4: Access Admin Panel
After login, navigate to: http://localhost:3001/admin

## Default User Accounts

The seed script creates these accounts:

| Role | Username | Email | Password | Access Level |
|------|----------|-------|----------|--------------|
| **Master Admin** | `admin` | admin@leetour.com | `admin123` | Full system access |
| **Country Admin** | `vietnam_admin` | vietnam.admin@leetour.com | `admin123` | Regional management |
| **Supplier** | `supplier_owner` | owner@saigontours.com | `supplier123` | Manage tours/bookings |
| **Accountant** | `accountant` | finance@leetour.com | `finance123` | Financial access |

## User Roles & Permissions

### 1. Master Administrator (`admin`)
- **Portal**: `/admin`
- **Full System Access**
  - Manage all users
  - Manage all tours and bookings
  - Financial management
  - System configuration
  - Approve suppliers
  - View analytics

### 2. Country Administrator (`country_admin`)
- **Portal**: `/admin`
- **Regional Management**
  - Manage regional users
  - Approve suppliers in their country
  - Manage regional tours and bookings
  - View regional analytics

### 3. Supplier (`supplier`)
- **Portal**: `/supplier`
- **Tour Management**
  - Create and manage tours
  - Handle bookings
  - View supplier analytics
  - Manage availability

### 4. Supervisor (`supervisor`)
- **Portal**: `/supervisor`
- **Team Management**
  - Manage supplier team members
  - Oversee operations
  - View team analytics

### 5. Accountant (`accountant`)
- **Portal**: `/accountant`
- **Financial Access**
  - View financial reports
  - Manage invoices
  - Process payouts

### 6. Moderator (`mod`)
- **Portal**: `/admin`
- **Content Moderation**
  - Review and moderate tours
  - Handle customer support
  - Manage bookings

### 7. Customer (`customer`)
- **Portal**: `/dashboard`
- **Basic Access**
  - Book tours
  - Manage personal bookings
  - View booking history

## Authentication Flow

### How Authentication Works

1. **Login Process**:
   - User submits credentials to `/api/auth/login`
   - Server validates credentials against MongoDB
   - JWT token is generated and returned
   - Token is stored in localStorage
   - User data is stored in AuthContext

2. **Route Protection**:
   - All dashboard routes are wrapped in `<ProtectedRoute>`
   - Routes check authentication status
   - Admin routes additionally check user role
   - Unauthorized users are redirected to login

3. **API Authentication**:
   - API routes use `verifyToken()` from `/src/lib/auth.js`
   - Admin endpoints use `adminAuth` middleware
   - Token must be included in Authorization header: `Bearer {token}`

## Admin Panel Features

### Available Admin Routes

- `/admin` - Admin Dashboard
- `/admin/users` - User Management
- `/admin/tours` - Tour Management
- `/admin/tours/new` - Create New Tour
- `/admin/tours/[id]/edit` - Edit Tour
- `/admin/bookings` - Booking Management
- `/admin/suppliers` - Supplier Management

## API Endpoints for Admin

### User Management
```
GET    /api/admin/users         - List all users
GET    /api/admin/users/:id     - Get user details
PUT    /api/admin/users/:id     - Update user
DELETE /api/admin/users/:id     - Delete user
```

### Tour Management
```
GET    /api/admin/tours         - List all tours
POST   /api/admin/tours         - Create tour
GET    /api/admin/tours/:id     - Get tour details
PUT    /api/admin/tours/:id     - Update tour
DELETE /api/admin/tours/:id     - Delete tour
```

### Supplier Management
```
GET    /api/admin/suppliers                    - List all suppliers
POST   /api/v1/admin/suppliers/:id/approve     - Approve supplier
```

## Creating Additional Admin Users

### Method 1: Using API (Programmatically)

```javascript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'newadmin',
    name: 'New Admin User',
    email: 'newadmin@example.com',
    password: 'securepassword123',
    role: 'admin',  // Must be done by existing admin via API
    phone: '+1234567890'
  })
});
```

**Note**: Regular registration defaults to 'customer' role. Only existing admins can create admin users via the user management panel.

### Method 2: Using MongoDB Shell

```bash
# Connect to MongoDB
docker exec -it leetour-mongodb mongosh -u leetour -p leetour123 --authenticationDatabase admin

# Use the database
use leetour

# Create admin user
db.users.insertOne({
  username: 'newadmin',
  name: 'New Admin User',
  email: 'newadmin@example.com',
  password: '$2a$12$hashedpasswordhere',  // Use bcrypt to hash
  role: 'admin',
  isActive: true,
  isEmailVerified: true,
  provider: 'local',
  permissions: ['system_admin'],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note**: Password must be bcrypt hashed with 12 salt rounds.

### Method 3: Using Admin Panel (Existing Admin Required)

1. Login as admin
2. Navigate to `/admin/users`
3. Click "Add User"
4. Select role as "admin"
5. Fill in user details
6. Save

## Security Best Practices

### Development Environment
1. ✅ Use seed data for initial setup
2. ✅ Local MongoDB is fine with default credentials
3. ✅ JWT_SECRET should still be set in `.env`

### Production Environment
1. ⚠️ **Change all default passwords immediately**
2. ⚠️ **Use strong JWT_SECRET** (generate with `openssl rand -base64 32`)
3. ⚠️ **Use MongoDB Atlas or secured MongoDB instance**
4. ⚠️ **Enable HTTPS/SSL**
5. ⚠️ **Implement rate limiting**
6. ⚠️ **Regular security audits**
7. ⚠️ **Use environment-specific `.env` files**

### Password Security
```bash
# Generate strong JWT secret
openssl rand -base64 32

# Update .env
JWT_SECRET=your_generated_secret_here
```

## Troubleshooting

### Cannot Login to Admin Panel

**Problem**: "Invalid credentials" error

**Solutions**:
1. Verify MongoDB is running: `docker-compose ps`
2. Check if seed data was created: `curl -X POST http://localhost:3001/api/seed`
3. Verify credentials: username=`admin`, password=`admin123`
4. Check browser console for errors
5. Verify `.env` has correct `MONGODB_URI` and `JWT_SECRET`

### "Access Denied" After Login

**Problem**: Logged in but can't access `/admin`

**Solutions**:
1. Check user role in MongoDB:
   ```bash
   docker exec -it leetour-mongodb mongosh -u leetour -p leetour123 --authenticationDatabase admin
   use leetour
   db.users.findOne({username: 'admin'})
   ```
2. Verify role is `'admin'` (not `'customer'` or other)
3. Clear localStorage and login again
4. Check browser console for errors

### Token Expired

**Problem**: "Token is not valid" error

**Solutions**:
1. Token expires after 24 hours - login again
2. Clear localStorage: `localStorage.clear()` in browser console
3. Logout and login again

### Protected Routes Not Working

**Problem**: Redirects to login even after successful login

**Solutions**:
1. Check localStorage has token: `localStorage.getItem('token')`
2. Verify AuthContext is properly wrapped in app
3. Check browser console for errors
4. Ensure JWT_SECRET matches between login and verification

## Development Tips

### Check Current User in Browser Console
```javascript
// Get current user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current User:', user);

// Get token
const token = localStorage.getItem('token');
console.log('Token:', token);
```

### Test API with Token
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);
```

### Force Logout
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/auth/auth1/login';
```

## Next Steps

1. ✅ Start MongoDB: `docker-compose up -d`
2. ✅ Seed database: `curl -X POST http://localhost:3001/api/seed`
3. ✅ Start Next.js: `npm run dev`
4. ✅ Login: http://localhost:3001/auth/auth1/login
5. ✅ Access admin: http://localhost:3001/admin

---

**Need Help?** Check the following files for implementation details:
- Authentication: [src/lib/auth.js](src/lib/auth.js)
- User Model: [src/models/User.js](src/models/User.js)
- Auth Context: [src/contexts/AuthContext.js](src/contexts/AuthContext.js)
- Protected Routes: [src/components/auth/ProtectedRoute.jsx](src/components/auth/ProtectedRoute.jsx)
- Role Management: [src/lib/roles.js](src/lib/roles.js)
