# Spa Management System - Quick Start Guide 🚀

## What's Ready NOW ✅

### Backend (100% Complete)
- ✅ 6 MongoDB schemas
- ✅ 28 API endpoints (fully functional)
- ✅ Seed data with sample customers, services, promotions
- ✅ Dashboard statistics API

### Frontend (Working Now)
- ✅ **Spa Dashboard** - Full statistics and customer list
- ✅ **Customer Management** - Complete CRUD operations
- ✅ **Navigation Menu** - Added to sidebar

## Quick Start (5 Minutes)

### Step 1: Start MongoDB
```bash
cd D:\Projects\GitLap\HoaiThuSpa_GitHub
docker-compose up -d
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Login
- Open: http://localhost:3001/auth/auth1/login
- Username: `admin`
- Password: `admin123`

### Step 4: Create Sample Data
Open browser console (F12) and run:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:3001/api/spa/seed', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(data => {
  console.log('✅ Seed data created!');
  console.log(data);
});
```

### Step 5: Access Spa Dashboard
Navigate to: **http://localhost:3001/spa/dashboard**

You should see:
- 📊 Statistics cards (customers, packages, revenue)
- 👥 List of customers with remaining services
- 📈 Usage statistics (today, this week, this month)
- 🔝 Top services
- 📝 Recent activities

### Step 6: Test Customer Management
Click **"Customers"** in the sidebar:
- ✅ View all customers
- ✅ Search by name, phone, or email
- ✅ Add new customer
- ✅ Edit customer
- ✅ Delete customer (soft delete)
- ✅ See remaining services for each customer

## What You'll See After Seed

The seed data creates:
- **5 Sample Customers** with Vietnamese names
- **8 Services**:
  - Swedish Massage (500k VND)
  - Deep Tissue Massage (650k VND)
  - Hot Stone Massage (750k VND)
  - Hydrating Facial (600k VND)
  - Anti-Aging Facial (850k VND)
  - Body Scrub (450k VND)
  - Aromatherapy Massage (700k VND)
  - Manicure & Pedicure (400k VND)

- **4 Promotions**:
  - Single Session (no discount)
  - 5 Times Package (10% off)
  - 10 Times Package (20% off)
  - 20 Times Package (30% off)

- **11 Service Packages** (Service + Promotion combinations)

- **3 Active Purchases**:
  - Customer 1: Swedish Massage 10x - 7 remaining
  - Customer 2: Hydrating Facial 10x - 8 remaining
  - Customer 3: Deep Tissue 5x - 4 remaining + Body Scrub 20x - 15 remaining

## Testing the APIs

### Get Token from Browser
Open console (F12):
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);
```

### Test Dashboard Stats
```bash
curl http://localhost:3001/api/spa/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Customer List
```bash
curl http://localhost:3001/api/spa/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Services List
```bash
curl http://localhost:3001/api/spa/services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create New Customer
```bash
curl -X POST http://localhost:3001/api/spa/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+84999888777",
    "dateOfBirth": "1990-01-01"
  }'
```

## What Each Page Shows

### Spa Dashboard
- **Overview Cards**:
  - Total Customers
  - Customers with Remaining Services
  - Active Packages
  - This Month Revenue

- **Usage Stats**:
  - Services used today
  - This week
  - This month

- **Main Table**: Customers with remaining services
  - Shows customer name, phone, remaining count
  - Click "View" to see details (future)
  - Quick "Record Usage" button

- **Top Services**: Most used services
- **Recent Activities**: Last 10 service usages

### Customers Page
- **Search Bar**: Search by name, phone, or email
- **Customer Table**:
  - Name, Phone, Email
  - Remaining Services count (green badge if > 0)
  - Status (Active/Inactive)
  - Actions: View, Edit, Delete

- **Add Customer Button**: Opens dialog with form
  - First Name, Middle Name, Last Name
  - Phone, Email, Date of Birth
  - Address fields
  - Notes

## Available Navigation

In the sidebar, you'll see **"Spa Management"** section with:
1. ✅ **Spa Dashboard** - Working now!
2. ✅ **Customers** - Working now!
3. ⏳ Services - Page not created yet
4. ⏳ Promotions - Page not created yet
5. ⏳ Service Packages - Page not created yet
6. ⏳ Record Usage - Page not created yet

## Common Issues

### Issue: Can't see Spa Dashboard in menu
**Solution**: Make sure you've logged in and the page has refreshed after updating MenuItems.js

### Issue: Seed fails with "Authentication required"
**Solution**: Make sure you're logged in and using the correct token

### Issue: Dashboard shows "0" everywhere
**Solution**: Run the seed data script first (Step 4 above)

### Issue: MongoDB not running
**Solution**:
```bash
docker-compose up -d
docker-compose ps  # Check if running
```

### Issue: Port 3001 already in use
**Solution**:
```bash
# Find process
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

## Next Steps

### To Complete the System (5 More Pages):

The remaining pages follow the same pattern as Customer page:
1. Copy `spa/customers/page.jsx`
2. Change API endpoint
3. Update table columns
4. Update form fields

**Estimated time**: 2-3 hours for all 5 pages

Or let me know and I can continue building them!

## File Structure

```
src/
├── models/
│   ├── SpaCustomer.js ✅
│   ├── SpaService.js ✅
│   ├── SpaPromotion.js ✅
│   ├── SpaServicePromotion.js ✅
│   ├── SpaCustomerPurchase.js ✅
│   └── SpaServiceUsage.js ✅
├── app/
│   ├── api/
│   │   └── spa/
│   │       ├── customers/ ✅
│   │       ├── services/ ✅
│   │       ├── promotions/ ✅
│   │       ├── service-promotions/ ✅
│   │       ├── purchases/ ✅
│   │       ├── usage/ ✅
│   │       ├── dashboard/stats/ ✅
│   │       └── seed/ ✅
│   └── (DashboardLayout)/
│       └── spa/
│           ├── dashboard/page.jsx ✅
│           ├── customers/page.jsx ✅
│           ├── services/page.jsx ⏳
│           ├── promotions/page.jsx ⏳
│           ├── service-promotions/page.jsx ⏳
│           ├── usage/page.jsx ⏳
│           └── customers/[id]/page.jsx ⏳
```

## Key Features Implemented

✅ **Authentication** - All routes protected
✅ **Search** - Customer search by name/phone/email
✅ **Pagination** - All lists have pagination
✅ **CRUD** - Full Create, Read, Update, Delete
✅ **Soft Delete** - Records marked inactive, not deleted
✅ **Validation** - Input validation on all forms
✅ **Real-time Stats** - Dashboard updates automatically
✅ **Responsive** - Works on all screen sizes
✅ **Error Handling** - Proper error messages
✅ **Success Messages** - Feedback on all actions

## Business Workflow

### How the System Works:

1. **Create Services** (e.g., Swedish Massage - 500k VND)
2. **Create Promotions** (e.g., 10 Times Package - 20% discount)
3. **System Creates Packages** (Swedish Massage + 10 Times = 400k VND per session)
4. **Customer Buys Package** (Creates Purchase with 10 times remaining)
5. **Customer Uses Service** (Decrements remaining count)
6. **Dashboard Shows** Customers with remaining services

## Support

For detailed documentation:
- [SPA_SYSTEM_WORKFLOW.md](SPA_SYSTEM_WORKFLOW.md) - Complete workflow
- [SPA_API_COMPLETE.md](SPA_API_COMPLETE.md) - All API endpoints
- [SPA_IMPLEMENTATION_STATUS.md](SPA_IMPLEMENTATION_STATUS.md) - What's done

---

**Enjoy your Spa Management System!** 🎉

Need help? Just ask!
