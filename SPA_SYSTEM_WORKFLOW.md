# Spa Management System - Implementation Workflow

## Progress Tracker

### ✅ Completed
- [x] MongoDB Schemas Created
  - [x] SpaCustomer
  - [x] SpaService
  - [x] SpaPromotion
  - [x] SpaServicePromotion
  - [x] SpaCustomerPurchase
  - [x] SpaServiceUsage
- [x] Customer API Routes Created
  - [x] GET /api/spa/customers (list with pagination & search)
  - [x] POST /api/spa/customers (create)
  - [x] GET /api/spa/customers/[id] (get details)
  - [x] PUT /api/spa/customers/[id] (update)
  - [x] DELETE /api/spa/customers/[id] (soft delete)

### 🚧 To Be Implemented

## Step 1: Complete API Routes

### 1.1 Service Management API
**File**: `src/app/api/spa/services/route.js`
```javascript
// GET - List all services
// POST - Create new service
```

**File**: `src/app/api/spa/services/[id]/route.js`
```javascript
// GET - Get service details
// PUT - Update service
// DELETE - Delete service
```

### 1.2 Promotion Management API
**File**: `src/app/api/spa/promotions/route.js`
```javascript
// GET - List all promotions
// POST - Create new promotion
```

**File**: `src/app/api/spa/promotions/[id]/route.js`
```javascript
// GET - Get promotion details
// PUT - Update promotion
// DELETE - Delete promotion
```

### 1.3 Service Promotion API
**File**: `src/app/api/spa/service-promotions/route.js`
```javascript
// GET - List all service-promotion combinations
// POST - Create service promotion (assign promotion to service)
```

**File**: `src/app/api/spa/service-promotions/[id]/route.js`
```javascript
// GET - Get service promotion details
// PUT - Update service promotion
// DELETE - Remove service promotion
```

### 1.4 Customer Purchase API
**File**: `src/app/api/spa/purchases/route.js`
```javascript
// GET - List all purchases
// POST - Create new purchase (customer buys service package)
```

**File**: `src/app/api/spa/purchases/[id]/route.js`
```javascript
// GET - Get purchase details
// PUT - Update purchase
// DELETE - Cancel purchase
```

**File**: `src/app/api/spa/purchases/customer/[customerId]/route.js`
```javascript
// GET - Get all purchases for a specific customer
```

### 1.5 Service Usage API
**File**: `src/app/api/spa/usage/route.js`
```javascript
// GET - List all usage records
// POST - Record service usage (customer uses one time from package)
```

**File**: `src/app/api/spa/usage/[id]/route.js`
```javascript
// GET - Get usage details
// PUT - Update usage record
// DELETE - Delete usage record
```

**File**: `src/app/api/spa/usage/customer/[customerId]/route.js`
```javascript
// GET - Get usage history for specific customer
```

### 1.6 Dashboard Statistics API
**File**: `src/app/api/spa/dashboard/stats/route.js`
```javascript
// GET - Get dashboard statistics
// - Total customers
// - Customers with remaining services
// - Total active packages
// - Total revenue
// - Services used today/this week/this month
// - Top services
// - Recent activities
```

## Step 2: Create Frontend Pages

### 2.1 Dashboard Page
**File**: `src/app/(DashboardLayout)/spa/dashboard/page.jsx`

**Features**:
- Show total customers
- Show customers with remaining services (table/list)
- Statistics cards (revenue, services used, active packages)
- Recent activities
- Charts (optional: service usage trends)

**Components Needed**:
- StatsCard component
- CustomerRemainingTable component
- RecentActivityList component

### 2.2 Customer List Page
**File**: `src/app/(DashboardLayout)/spa/customers/page.jsx`

**Features**:
- List all customers with pagination
- Search by name, phone, email
- Filter by active/inactive
- Add new customer button → Opens dialog
- Edit customer → Opens dialog
- Delete customer (soft delete)
- View customer detail → Links to detail page
- Show remaining services count for each customer

**Components Needed**:
- CustomerTable component
- CustomerDialog component (for add/edit)
- SearchBar component
- DeleteConfirmDialog component

### 2.3 Customer Detail Page
**File**: `src/app/(DashboardLayout)/spa/customers/[id]/page.jsx`

**Features**:
- Customer information
- Purchase history (packages bought)
- Usage history (services used)
- Remaining services by package
- Quick action: Record service usage
- Quick action: Sell new package

**Components Needed**:
- CustomerInfo component
- PurchaseHistoryTable component
- UsageHistoryTable component
- QuickActionButtons component

### 2.4 Service List Page
**File**: `src/app/(DashboardLayout)/spa/services/page.jsx`

**Features**:
- List all services
- Add new service
- Edit service
- Delete service
- View service details

**Components Needed**:
- ServiceTable component
- ServiceDialog component (for add/edit)
- DeleteConfirmDialog component

### 2.5 Service Promotion List Page
**File**: `src/app/(DashboardLayout)/spa/service-promotions/page.jsx`

**Features**:
- List all service-promotion combinations
- Create new service promotion (assign promotion to service)
- Edit service promotion details
- Delete service promotion
- Show final price and times included

**Components Needed**:
- ServicePromotionTable component
- ServicePromotionDialog component
- ServiceSelector component
- PromotionSelector component

### 2.6 Customer Using Service Page
**File**: `src/app/(DashboardLayout)/spa/usage/page.jsx`

**Features**:
- Select customer (search/dropdown)
- View customer's active packages
- Select package to use
- Record service usage
- Add notes
- Show remaining count
- Usage history table

**Components Needed**:
- CustomerSearchAutocomplete component
- ActivePackagesDisplay component
- UsageRecordForm component
- UsageHistoryTable component

### 2.7 Promotions Management Page
**File**: `src/app/(DashboardLayout)/spa/promotions/page.jsx`

**Features**:
- List all promotions
- Add new promotion
- Edit promotion
- Delete promotion
- Show active/expired status

**Components Needed**:
- PromotionTable component
- PromotionDialog component
- DeleteConfirmDialog component

## Step 3: Update Sidebar Navigation

**File**: `src/app/(DashboardLayout)/layout/vertical/sidebar/MenuItems.js`

Add new menu section:

```javascript
{
  navlabel: true,
  subheader: 'Spa Management',
},
{
  id: 'spa-dashboard',
  title: 'Spa Dashboard',
  icon: IconDashboard,
  href: '/spa/dashboard',
},
{
  id: 'spa-customers',
  title: 'Customers',
  icon: IconUsers,
  href: '/spa/customers',
},
{
  id: 'spa-services',
  title: 'Services',
  icon: IconSpa,
  href: '/spa/services',
},
{
  id: 'spa-promotions',
  title: 'Promotions',
  icon: IconGift,
  href: '/spa/promotions',
},
{
  id: 'spa-service-promotions',
  title: 'Service Packages',
  icon: IconPackage,
  href: '/spa/service-promotions',
},
{
  id: 'spa-usage',
  title: 'Record Service Usage',
  icon: IconClipboardCheck,
  href: '/spa/usage',
},
```

## Step 4: Seed Data for Spa System

**File**: `src/app/api/spa/seed/route.js`

Create seed data:
```javascript
// Sample Services
// Sample Promotions
// Sample Service Promotions
// Sample Customers
// Sample Purchases
// Sample Usage Records
```

## Step 5: Common Components to Create

### 5.1 Reusable Components

**Location**: `src/app/components/spa/`

Components to create:
- `CustomerSearchAutocomplete.jsx` - Search and select customer
- `ServiceSelector.jsx` - Dropdown to select service
- `PromotionSelector.jsx` - Dropdown to select promotion
- `DeleteConfirmDialog.jsx` - Confirmation dialog for deletions
- `DateRangePicker.jsx` - Select date range for reports
- `StatsCard.jsx` - Display statistics in cards
- `DataTable.jsx` - Reusable table with pagination
- `FormDialog.jsx` - Reusable dialog for forms

### 5.2 Custom Hooks

**Location**: `src/hooks/spa/`

Hooks to create:
- `useCustomers.js` - Fetch and manage customers
- `useServices.js` - Fetch and manage services
- `usePromotions.js` - Fetch and manage promotions
- `usePurchases.js` - Fetch and manage purchases
- `useUsage.js` - Fetch and manage usage records
- `useDashboardStats.js` - Fetch dashboard statistics

## Step 6: Testing Workflow

### 6.1 Test Data Creation
1. Start MongoDB
2. Run seed script
3. Verify data in Mongo Express

### 6.2 API Testing
Test each endpoint with:
- Valid data
- Invalid data
- Missing authentication
- Edge cases

### 6.3 Frontend Testing
1. Test all CRUD operations
2. Test search and filters
3. Test pagination
4. Test form validations
5. Test responsive design

## Implementation Priority

### Phase 1: Core Functionality (Week 1)
1. ✅ Database schemas
2. ✅ Customer API
3. Service API
4. Customer List Page
5. Service List Page
6. Dashboard with basic stats

### Phase 2: Sales & Usage (Week 2)
1. Promotion API
2. Service Promotion API
3. Customer Purchase API
4. Service Usage API
5. Promotions Page
6. Service Promotions Page
7. Usage Recording Page

### Phase 3: Polish & Features (Week 3)
1. Customer Detail Page
2. Advanced Dashboard
3. Reports and Analytics
4. Search and Filters
5. Notifications
6. Export functionality

## Database Relationships

```
SpaCustomer (1) ----< (M) SpaCustomerPurchase
SpaServicePromotion (1) ----< (M) SpaCustomerPurchase
SpaService (1) ----< (M) SpaServicePromotion
SpaPromotion (1) ----< (M) SpaServicePromotion
SpaCustomerPurchase (1) ----< (M) SpaServiceUsage
SpaCustomer (1) ----< (M) SpaServiceUsage
```

## Key Business Logic

### When Customer Buys Service Package:
1. Select Service Promotion (Service + Promotion combo)
2. Get final price and times included
3. Create SpaCustomerPurchase record
4. Set timesRemaining = totalTimesIncluded
5. Set status = 'active'

### When Customer Uses Service:
1. Select Customer
2. Show their active purchases (status='active', timesRemaining > 0)
3. Select which package to use
4. Create SpaServiceUsage record
5. Decrement timesRemaining in SpaCustomerPurchase
6. If timesRemaining = 0, set status = 'completed'

### Dashboard Logic:
1. Count customers with timesRemaining > 0
2. Show list of these customers
3. Allow quick access to record usage

## Sample API Calls

### Create Customer
```javascript
POST /api/spa/customers
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "email": "john@example.com"
}
```

### Customer Buys Package
```javascript
POST /api/spa/purchases
{
  "customerId": "...",
  "servicePromotionId": "...",
  "paymentAmount": 500,
  "paymentMethod": "cash"
}
```

### Record Service Usage
```javascript
POST /api/spa/usage
{
  "customerPurchaseId": "...",
  "customerId": "...",
  "staffMember": "Alice",
  "note": "Customer satisfied"
}
```

## Next Steps

Run these commands to continue:

```bash
# 1. Start MongoDB
docker-compose up -d

# 2. Start development server
npm run dev

# 3. Test customer API
curl http://localhost:3001/api/spa/customers
```

---

**Current Status**: ✅ Database schemas and Customer API completed
**Next Task**: Create Service Management API and Pages

Would you like me to continue implementing the remaining APIs and pages?
