# Spa Management System - API Implementation Complete ✅

## All APIs Completed!

### ✅ Database Schemas (6 Models)
- **SpaCustomer** - Customer information
- **SpaService** - Spa services offered
- **SpaPromotion** - Promotion packages
- **SpaServicePromotion** - Service + Promotion combinations
- **SpaCustomerPurchase** - Customer purchases with remaining count
- **SpaServiceUsage** - Service usage tracking

### ✅ Complete API Routes

#### 1. Customer Management
```
GET    /api/spa/customers                    - List all customers (with search & pagination)
POST   /api/spa/customers                    - Create new customer
GET    /api/spa/customers/[id]               - Get customer details + history
PUT    /api/spa/customers/[id]               - Update customer
DELETE /api/spa/customers/[id]               - Soft delete customer
```

#### 2. Service Management
```
GET    /api/spa/services                     - List all services
POST   /api/spa/services                     - Create new service
GET    /api/spa/services/[id]                - Get service details
PUT    /api/spa/services/[id]                - Update service
DELETE /api/spa/services/[id]                - Soft delete service
```

#### 3. Promotion Management
```
GET    /api/spa/promotions                   - List all promotions
POST   /api/spa/promotions                   - Create new promotion
GET    /api/spa/promotions/[id]              - Get promotion details
PUT    /api/spa/promotions/[id]              - Update promotion
DELETE /api/spa/promotions/[id]              - Soft delete promotion
```

#### 4. Service Promotion (Packages)
```
GET    /api/spa/service-promotions           - List all service packages
POST   /api/spa/service-promotions           - Create service package (Service + Promotion)
GET    /api/spa/service-promotions/[id]      - Get package details
PUT    /api/spa/service-promotions/[id]      - Update package
DELETE /api/spa/service-promotions/[id]      - Soft delete package
```

#### 5. Customer Purchases
```
GET    /api/spa/purchases                           - List all purchases
POST   /api/spa/purchases                           - Create purchase (customer buys package)
GET    /api/spa/purchases/[id]                      - Get purchase details
PUT    /api/spa/purchases/[id]                      - Update purchase
DELETE /api/spa/purchases/[id]                      - Cancel purchase
GET    /api/spa/purchases/customer/[customerId]     - Get customer's purchases
```

#### 6. Service Usage Tracking
```
GET    /api/spa/usage                        - List all usage records
POST   /api/spa/usage                        - Record service usage (decrements count)
GET    /api/spa/usage/[id]                   - Get usage details
PUT    /api/spa/usage/[id]                   - Update usage record
DELETE /api/spa/usage/[id]                   - Delete usage (admin only, restores count)
```

#### 7. Dashboard & Statistics
```
GET    /api/spa/dashboard/stats              - Get comprehensive dashboard stats
```

**Dashboard Stats Include:**
- Total customers
- Customers with remaining services (with details)
- Total active packages
- Total revenue (all time & this month)
- Services used (today, this week, this month)
- Top 5 services by usage
- Recent activities (last 10)
- Services expiring soon

## Business Logic Flow

### Flow 1: Customer Buys Service Package
```
1. Admin selects Service (e.g., "Swedish Massage")
2. Admin selects Promotion (e.g., "10 times package")
3. System checks SpaServicePromotion exists
   - If not, create it (calculates final price)
4. Admin creates Purchase
   - Links to Customer
   - Links to ServicePromotion
   - Sets totalTimesIncluded = 10
   - Sets timesRemaining = 10
   - Status = 'active'
```

### Flow 2: Customer Uses Service
```
1. Select Customer
2. Show their active purchases (status='active', timesRemaining > 0)
3. Select which package to use
4. Record usage:
   - Create SpaServiceUsage record
   - Decrement timesRemaining in SpaCustomerPurchase
   - If timesRemaining = 0, set status = 'completed'
```

### Flow 3: Dashboard View
```
1. Show total customers
2. Show customers with remaining services
   - List each customer
   - Show total remaining count
   - Click to see details or record usage
```

## API Usage Examples

### Example 1: Create Customer
```bash
curl -X POST http://localhost:3001/api/spa/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+84901234567",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-01",
    "address": {
      "street": "123 Main St",
      "city": "HCMC"
    }
  }'
```

### Example 2: Create Service
```bash
curl -X POST http://localhost:3001/api/spa/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swedish Massage",
    "description": "Relaxing full body massage",
    "basePrice": 500000,
    "duration": 60,
    "category": "massage"
  }'
```

### Example 3: Create Promotion
```bash
curl -X POST http://localhost:3001/api/spa/promotions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "10 Times Package",
    "description": "Buy 10 sessions, get 20% off",
    "reduceTimes": 10,
    "discountPercentage": 20
  }'
```

### Example 4: Create Service Package
```bash
curl -X POST http://localhost:3001/api/spa/service-promotions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "SERVICE_ID",
    "promotionId": "PROMOTION_ID"
  }'
```

### Example 5: Customer Buys Package
```bash
curl -X POST http://localhost:3001/api/spa/purchases \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "servicePromotionId": "SERVICE_PROMOTION_ID",
    "paymentAmount": 4000000,
    "paymentMethod": "card"
  }'
```

### Example 6: Record Service Usage
```bash
curl -X POST http://localhost:3001/api/spa/usage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerPurchaseId": "PURCHASE_ID",
    "customerId": "CUSTOMER_ID",
    "staffMember": "Alice",
    "note": "Customer very satisfied",
    "rating": 5
  }'
```

### Example 7: Get Dashboard Stats
```bash
curl -X GET http://localhost:3001/api/spa/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 8: Search Customers
```bash
curl -X GET "http://localhost:3001/api/spa/customers?search=john&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 9: Get Customer's Active Purchases
```bash
curl -X GET "http://localhost:3001/api/spa/purchases/customer/CUSTOMER_ID?activeOnly=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Workflow

### 1. Start MongoDB
```bash
docker-compose up -d
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Login and Get Token
```bash
# Login as admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Save the token from response
```

### 4. Test APIs
Use the token in Authorization header:
```bash
curl -X GET http://localhost:3001/api/spa/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps: Frontend Development

Now that all APIs are complete, you need to create:

### 1. Dashboard Page
**Location**: `src/app/(DashboardLayout)/spa/dashboard/page.jsx`

**Features**:
- Statistics cards (total customers, revenue, etc.)
- Customers with remaining services table
- Recent activities list
- Quick action buttons

### 2. Customers Page
**Location**: `src/app/(DashboardLayout)/spa/customers/page.jsx`

**Features**:
- Customer list with search
- Add/Edit customer dialog
- View customer details
- Delete customer

### 3. Services Page
**Location**: `src/app/(DashboardLayout)/spa/services/page.jsx`

**Features**:
- Service list
- Add/Edit service dialog
- Delete service

### 4. Promotions Page
**Location**: `src/app/(DashboardLayout)/spa/promotions/page.jsx`

**Features**:
- Promotion list
- Add/Edit promotion dialog
- Delete promotion

### 5. Service Packages Page
**Location**: `src/app/(DashboardLayout)/spa/service-promotions/page.jsx`

**Features**:
- Package list (Service + Promotion combinations)
- Create package (select service & promotion)
- Show final price and times included

### 6. Usage Recording Page
**Location**: `src/app/(DashboardLayout)/spa/usage/page.jsx`

**Features**:
- Search customer
- Show customer's active packages
- Select package to use
- Record usage with notes

### 7. Update Sidebar
**File**: `src/app/(DashboardLayout)/layout/vertical/sidebar/MenuItems.js`

Add Spa Management section to navigation menu.

## Key Features Implemented

✅ **Authentication** - All routes protected with JWT
✅ **Pagination** - All list endpoints support pagination
✅ **Search** - Customers search by name, phone, email
✅ **Filtering** - Filter by status, category, etc.
✅ **Soft Delete** - Mark records as inactive instead of deleting
✅ **Validation** - Input validation on all endpoints
✅ **Error Handling** - Comprehensive error messages
✅ **Relationships** - Proper MongoDB relationships with populate
✅ **Auto Calculation** - Auto-calculate remaining times, final price
✅ **Status Management** - Auto-update status (active/completed/expired)
✅ **Audit Trail** - Track usage history with timestamps
✅ **Dashboard Analytics** - Comprehensive statistics

## Database Indexes

All models have proper indexes for optimal query performance:
- Customer: phoneNumber, email, name
- Service: name, category
- Promotion: name, dates
- ServicePromotion: serviceId + promotionId (unique)
- Purchase: customerId, status, paymentDate
- Usage: customerId, purchaseId, usingDateTime

## Status Enum Values

### Purchase Status
- `active` - Can be used
- `completed` - All uses consumed
- `expired` - Past expiry date
- `cancelled` - Purchase cancelled

### Payment Methods
- `cash`
- `card`
- `transfer`
- `other`

### Service Categories
- `massage`
- `facial`
- `body_treatment`
- `nail_care`
- `hair_care`
- `other`

## Ready for Frontend Development!

All backend APIs are complete and tested. You can now:
1. Create seed data
2. Test APIs with Postman/curl
3. Build frontend pages
4. Connect frontend to these APIs

Would you like me to continue with:
- **Option A**: Create seed data script
- **Option B**: Build frontend pages
- **Option C**: Both!
