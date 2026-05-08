# 📚 Backend API Documentation

Complete documentation of all backend APIs in the FarmDirect application.

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Product APIs](#product-apis)
3. [Order APIs](#order-apis)
4. [Admin APIs](#admin-apis)
5. [Payment APIs](#payment-apis)
6. [Chatbot APIs](#chatbot-apis)
7. [Upload APIs](#upload-apis)

---

## 🔐 Authentication APIs

**Base URL:** `/api/auth`

### 1. Register User

**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**File:** `server/controllers/authController.js`

**Purpose:** Register a new user (buyer or farmer)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer",  // or "farmer"
  "phone": "1234567890",
  "location": {
    "address": "123 Main St",
    "city": "New Delhi",
    "state": "Delhi",
    "postalCode": "110001"
  },
  "farmName": "Green Farm",  // Required for farmers
  "businessName": "John's Restaurant"  // Required for buyers
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "token": "jwt_token_here"
}
```

**What it does:**
1. Validates required fields
2. Checks if user already exists
3. Hashes password with bcrypt
4. Geocodes address to get coordinates (for farmers)
5. Creates user in database
6. Generates JWT token
7. Returns user data with token

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**File:** `server/controllers/authController.js`

**Purpose:** Login existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "token": "jwt_token_here"
}
```

**What it does:**
1. Finds user by email
2. Compares password with hashed password
3. Generates JWT token
4. Returns user data with token

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`  
**Access:** Private (requires token)  
**File:** `server/controllers/authController.js`

**Purpose:** Get logged-in user's profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "phone": "1234567890",
  "location": { ... }
}
```

**What it does:**
1. Verifies JWT token
2. Finds user by ID from token
3. Returns user profile (without password)

---

### 4. Update User Profile

**Endpoint:** `PUT /api/auth/profile`  
**Access:** Private  
**File:** `server/controllers/authController.js`

**Purpose:** Update user profile information

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "location": { ... }
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Updated",
  "email": "john@example.com",
  // ... updated fields
}
```

**What it does:**
1. Finds user by ID
2. Updates allowed fields
3. Saves to database
4. Returns updated user

---

### 5. Update Farmer Location

**Endpoint:** `PUT /api/auth/location`  
**Access:** Private (farmers only)  
**File:** `server/controllers/authController.js`

**Purpose:** Update farmer's location coordinates

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "address": "New Farm Address"
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "location": { ... }
}
```

---

### 6. Get All Farmers

**Endpoint:** `GET /api/auth/farmers`  
**Access:** Public  
**File:** `server/controllers/authController.js`

**Purpose:** Get list of approved farmers

**Query Parameters:**
- `category` - Filter by product category
- `lat` - User latitude (for nearby search)
- `lng` - User longitude (for nearby search)

**Response:**
```json
[
  {
    "_id": "farmer_id",
    "name": "Farmer Name",
    "farmName": "Green Farm",
    "email": "farmer@example.com",
    "location": { ... },
    "products": [ ... ]
  }
]
```

**What it does:**
1. Finds farmers with approved status
2. Filters by category if provided
3. Filters by location if coordinates provided
4. Populates products
5. Returns farmer list

---

### 7. Get Category Stats

**Endpoint:** `GET /api/auth/categories/stats`  
**Access:** Public  
**File:** `server/controllers/authController.js`

**Purpose:** Get count of farmers per category

**Response:**
```json
{
  "Vegetables": 25,
  "Fruits": 18,
  "Dairy": 12,
  "Grains": 8
}
```

---

### 8. Get Platform Stats

**Endpoint:** `GET /api/auth/stats`  
**Access:** Public  
**File:** `server/controllers/authController.js`

**Purpose:** Get real-time platform statistics

**Response:**
```json
{
  "activeFarmers": {
    "count": 523,
    "display": "523+"
  },
  "happyBuyers": {
    "count": 2145,
    "display": "2.1k+"
  },
  "ordersDelivered": {
    "count": 15678,
    "display": "15.7k+"
  }
}
```

**What it does:**
1. Counts approved farmers
2. Counts total buyers
3. Counts delivered orders
4. Formats numbers for display
5. Returns statistics

---

## 📦 Product APIs

**Base URL:** `/api/products`

### 1. Get All Products

**Endpoint:** `GET /api/products`  
**Access:** Public  
**File:** `server/controllers/productController.js`

**Purpose:** Get list of all products with pagination

**Query Parameters:**
- `keyword` - Search by product name
- `farmerId` - Filter by farmer
- `pageNumber` - Page number (default: 1)
- `lat` & `lng` - Filter by location

**Response:**
```json
{
  "products": [
    {
      "_id": "product_id",
      "name": "Organic Tomatoes",
      "category": "Vegetables",
      "price": 50,
      "quantity": 100,
      "unit": "kg",
      "farmer": {
        "_id": "farmer_id",
        "name": "Farmer Name",
        "farmName": "Green Farm"
      }
    }
  ],
  "page": 1,
  "pages": 5
}
```

**What it does:**
1. Builds query with filters
2. Paginates results (10 per page)
3. Populates farmer details
4. Returns products with pagination info

---

### 2. Get Product by ID

**Endpoint:** `GET /api/products/:id`  
**Access:** Public  
**File:** `server/controllers/productController.js`

**Purpose:** Get single product details

**Response:**
```json
{
  "_id": "product_id",
  "name": "Organic Tomatoes",
  "category": "Vegetables",
  "price": 50,
  "quantity": 100,
  "unit": "kg",
  "description": "Fresh organic tomatoes",
  "images": ["image_url"],
  "location": { ... },
  "farmer": {
    "_id": "farmer_id",
    "name": "Farmer Name",
    "farmName": "Green Farm",
    "email": "farmer@example.com",
    "phone": "1234567890"
  }
}
```

---

### 3. Create Product

**Endpoint:** `POST /api/products`  
**Access:** Private (farmers only)  
**File:** `server/controllers/productController.js`

**Purpose:** Create a new product listing

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Organic Tomatoes",
  "category": "Vegetables",
  "quantity": 100,
  "unit": "kg",
  "price": 50,
  "description": "Fresh organic tomatoes",
  "images": ["image_url"],
  "location": "Farm Address",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "availabilityDate": "2024-05-10"
}
```

**Response:**
```json
{
  "_id": "product_id",
  "farmer": "farmer_id",
  "name": "Organic Tomatoes",
  // ... all product fields
}
```

**What it does:**
1. Validates farmer role
2. Creates location object with coordinates
3. Creates product in database
4. Links to farmer
5. Returns created product

---

### 4. Update Product

**Endpoint:** `PUT /api/products/:id`  
**Access:** Private (product owner only)  
**File:** `server/controllers/productController.js`

**Purpose:** Update existing product

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 60,
  "quantity": 150
  // ... any fields to update
}
```

**Response:**
```json
{
  "_id": "product_id",
  // ... updated product fields
}
```

**What it does:**
1. Finds product by ID
2. Checks if user is product owner
3. Updates fields
4. Saves to database
5. Returns updated product

---

### 5. Delete Product

**Endpoint:** `DELETE /api/products/:id`  
**Access:** Private (product owner only)  
**File:** `server/controllers/productController.js`

**Purpose:** Delete a product listing

**Response:**
```json
{
  "message": "Product removed"
}
```

**What it does:**
1. Finds product by ID
2. Checks if user is product owner
3. Deletes product from database
4. Returns success message

---

### 6. Get My Products

**Endpoint:** `GET /api/products/myproducts`  
**Access:** Private (farmers only)  
**File:** `server/controllers/productController.js`

**Purpose:** Get all products of logged-in farmer

**Response:**
```json
[
  {
    "_id": "product_id",
    "name": "Organic Tomatoes",
    // ... product fields
  }
]
```

**What it does:**
1. Finds all products by farmer ID
2. Returns farmer's products

---

## 🛒 Order APIs

**Base URL:** `/api/orders`

### 1. Create Order

**Endpoint:** `POST /api/orders`  
**Access:** Private  
**File:** `server/controllers/orderController.js`

**Purpose:** Create a new order

**Request Body:**
```json
{
  "orderItems": [
    {
      "name": "Organic Tomatoes",
      "qty": 10,
      "image": "image_url",
      "price": 50,
      "product": "product_id"
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New Delhi",
    "postalCode": "110001",
    "country": "India"
  },
  "paymentMethod": "Razorpay",
  "totalPrice": 500,
  "farmerId": "farmer_id",
  "paymentInfo": {
    "razorpay_order_id": "order_id",
    "razorpay_payment_id": "payment_id",
    "razorpay_signature": "signature"
  }
}
```

**Response:**
```json
{
  "_id": "order_id",
  "buyer": "buyer_id",
  "farmer": "farmer_id",
  "orderItems": [ ... ],
  "shippingAddress": { ... },
  "paymentMethod": "Razorpay",
  "totalPrice": 500,
  "status": "Pending",
  "createdAt": "2024-05-08T..."
}
```

**What it does:**
1. Validates order items
2. Creates order in database
3. Sends email to farmer (new order notification)
4. Returns created order

---

### 2. Get Order by ID

**Endpoint:** `GET /api/orders/:id`  
**Access:** Private  
**File:** `server/controllers/orderController.js`

**Purpose:** Get single order details

**Response:**
```json
{
  "_id": "order_id",
  "buyer": {
    "_id": "buyer_id",
    "name": "Buyer Name",
    "email": "buyer@example.com"
  },
  "farmer": {
    "_id": "farmer_id",
    "name": "Farmer Name",
    "farmName": "Green Farm"
  },
  "orderItems": [ ... ],
  "shippingAddress": { ... },
  "paymentMethod": "Razorpay",
  "totalPrice": 500,
  "status": "Pending",
  "isPaid": true,
  "paidAt": "2024-05-08T...",
  "createdAt": "2024-05-08T..."
}
```

---

### 3. Update Order to Paid

**Endpoint:** `PUT /api/orders/:id/pay`  
**Access:** Private  
**File:** `server/controllers/orderController.js`

**Purpose:** Mark order as paid

**Request Body:**
```json
{
  "id": "payment_id",
  "status": "completed",
  "update_time": "2024-05-08T...",
  "email_address": "buyer@example.com"
}
```

**Response:**
```json
{
  "_id": "order_id",
  "isPaid": true,
  "paidAt": "2024-05-08T...",
  // ... order fields
}
```

---

### 4. Update Order Status

**Endpoint:** `PUT /api/orders/:id/status`  
**Access:** Private (farmer only)  
**File:** `server/controllers/orderController.js`

**Purpose:** Update order status (Confirmed, Shipped, Delivered, Cancelled)

**Request Body:**
```json
{
  "status": "Confirmed"  // or "Shipped", "Delivered", "Cancelled"
}
```

**Response:**
```json
{
  "_id": "order_id",
  "status": "Confirmed",
  // ... order fields
}
```

**What it does:**
1. Finds order by ID
2. Checks if user is the farmer
3. Updates status
4. Sends email to buyer based on status:
   - Confirmed → "Order Confirmed" email
   - Shipped → "Order Shipped" email
   - Delivered → "Order Delivered" email
   - Cancelled → "Order Cancelled" email
5. Returns updated order

---

### 5. Get My Orders

**Endpoint:** `GET /api/orders/myorders`  
**Access:** Private (buyers)  
**File:** `server/controllers/orderController.js`

**Purpose:** Get all orders of logged-in buyer

**Response:**
```json
[
  {
    "_id": "order_id",
    "farmer": {
      "name": "Farmer Name",
      "farmName": "Green Farm"
    },
    "totalPrice": 500,
    "status": "Pending",
    "createdAt": "2024-05-08T..."
  }
]
```

---

### 6. Get Farmer Orders

**Endpoint:** `GET /api/orders/farmerorders`  
**Access:** Private (farmers)  
**File:** `server/controllers/orderController.js`

**Purpose:** Get all orders for logged-in farmer

**Response:**
```json
[
  {
    "_id": "order_id",
    "buyer": {
      "name": "Buyer Name",
      "email": "buyer@example.com"
    },
    "totalPrice": 500,
    "status": "Pending",
    "createdAt": "2024-05-08T..."
  }
]
```

---

## 👨‍💼 Admin APIs

**Base URL:** `/api/admin`  
**Access:** All require admin role

### 1. Get Admin Stats

**Endpoint:** `GET /api/admin/stats`  
**File:** `server/controllers/adminController.js`

**Purpose:** Get dashboard statistics

**Response:**
```json
{
  "stats": {
    "totalUsers": 1000,
    "totalFarmers": 500,
    "approvedFarmers": 450,
    "pendingFarmers": 50,
    "totalBuyers": 500,
    "totalOrders": 2000,
    "totalRevenue": 500000
  },
  "recentActivity": {
    "recentFarmers": [ ... ],
    "recentOrders": [ ... ]
  }
}
```

**What it does:**
1. Counts users by role
2. Counts farmers by approval status
3. Counts total orders
4. Calculates total revenue
5. Gets recent farmers and orders
6. Returns comprehensive stats

---

### 2. Get All Farmers

**Endpoint:** `GET /api/admin/farmers`  
**File:** `server/controllers/adminController.js`

**Query Parameters:**
- `status` - Filter by approval status (pending, approved, rejected)
- `search` - Search by name or email
- `limit` - Number of results

**Response:**
```json
{
  "farmers": [
    {
      "_id": "farmer_id",
      "name": "Farmer Name",
      "email": "farmer@example.com",
      "farmName": "Green Farm",
      "approvalStatus": "pending",
      "createdAt": "2024-05-08T..."
    }
  ]
}
```

---

### 3. Get Pending Farmers

**Endpoint:** `GET /api/admin/farmers/pending`  
**File:** `server/controllers/adminController.js`

**Purpose:** Get farmers waiting for approval

**Response:**
```json
[
  {
    "_id": "farmer_id",
    "name": "Farmer Name",
    "email": "farmer@example.com",
    "farmName": "Green Farm",
    "location": { ... },
    "createdAt": "2024-05-08T..."
  }
]
```

---

### 4. Get Farmer by ID

**Endpoint:** `GET /api/admin/farmers/:id`  
**File:** `server/controllers/adminController.js`

**Purpose:** Get detailed farmer information

**Response:**
```json
{
  "_id": "farmer_id",
  "name": "Farmer Name",
  "email": "farmer@example.com",
  "farmName": "Green Farm",
  "location": { ... },
  "approvalStatus": "pending",
  "products": [ ... ],
  "productCount": 5,
  "orderCount": 10,
  "createdAt": "2024-05-08T..."
}
```

---

### 5. Approve Farmer

**Endpoint:** `PUT /api/admin/farmers/:id/approve`  
**File:** `server/controllers/adminController.js`

**Purpose:** Approve a farmer's registration

**Request Body:**
```json
{
  "notes": "Approved after verification"
}
```

**Response:**
```json
{
  "message": "Farmer approved successfully",
  "farmer": {
    "_id": "farmer_id",
    "approvalStatus": "approved",
    "isApproved": true,
    "approvalDate": "2024-05-08T...",
    "approvedBy": "admin_id"
  }
}
```

**What it does:**
1. Finds farmer by ID
2. Updates approval status to "approved"
3. Sets isApproved to true
4. Records approval date and admin
5. Saves notes
6. Returns updated farmer

---

### 6. Reject Farmer

**Endpoint:** `PUT /api/admin/farmers/:id/reject`  
**File:** `server/controllers/adminController.js`

**Purpose:** Reject a farmer's registration

**Request Body:**
```json
{
  "notes": "Incomplete documentation"
}
```

**Response:**
```json
{
  "message": "Farmer rejected",
  "farmer": {
    "_id": "farmer_id",
    "approvalStatus": "rejected",
    "isApproved": false
  }
}
```

---

### 7. Get All Buyers

**Endpoint:** `GET /api/admin/buyers`  
**File:** `server/controllers/adminController.js`

**Query Parameters:**
- `search` - Search by name or email

**Response:**
```json
{
  "buyers": [
    {
      "_id": "buyer_id",
      "name": "Buyer Name",
      "email": "buyer@example.com",
      "businessName": "Restaurant",
      "orderCount": 15,
      "totalSpent": 5000,
      "createdAt": "2024-05-08T..."
    }
  ]
}
```

---

### 8. Get Buyer by ID

**Endpoint:** `GET /api/admin/buyers/:id`  
**File:** `server/controllers/adminController.js`

**Purpose:** Get detailed buyer information

**Response:**
```json
{
  "_id": "buyer_id",
  "name": "Buyer Name",
  "email": "buyer@example.com",
  "businessName": "Restaurant",
  "orders": [ ... ],
  "orderCount": 15,
  "totalSpent": 5000,
  "createdAt": "2024-05-08T..."
}
```

---

### 9. Get All Orders

**Endpoint:** `GET /api/admin/orders`  
**File:** `server/controllers/adminController.js`

**Query Parameters:**
- `status` - Filter by order status
- `search` - Search by order ID or buyer name

**Response:**
```json
{
  "orders": [
    {
      "_id": "order_id",
      "buyer": { ... },
      "farmer": { ... },
      "totalPrice": 500,
      "status": "Pending",
      "createdAt": "2024-05-08T..."
    }
  ]
}
```

---

### 10. Get Order by ID

**Endpoint:** `GET /api/admin/orders/:id`  
**File:** `server/controllers/adminController.js`

**Purpose:** Get detailed order information

**Response:**
```json
{
  "_id": "order_id",
  "buyer": { ... },
  "farmer": { ... },
  "orderItems": [ ... ],
  "shippingAddress": { ... },
  "paymentMethod": "Razorpay",
  "totalPrice": 500,
  "status": "Pending",
  "createdAt": "2024-05-08T..."
}
```

---

### 11. Get System Analytics

**Endpoint:** `GET /api/admin/analytics`  
**File:** `server/controllers/adminController.js`

**Purpose:** Get comprehensive system analytics

**Response:**
```json
{
  "userGrowth": [ ... ],
  "orderTrends": [ ... ],
  "revenueByMonth": [ ... ],
  "topFarmers": [ ... ],
  "topBuyers": [ ... ],
  "categoryDistribution": { ... }
}
```

---

### 12. Update User Status

**Endpoint:** `PUT /api/admin/users/:id/status`  
**File:** `server/controllers/adminController.js`

**Purpose:** Activate/deactivate user account

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "message": "User status updated",
  "user": { ... }
}
```

---

## 💳 Payment APIs

**Base URL:** `/api/payment`

### 1. Get Razorpay Key

**Endpoint:** `GET /api/payment/key`  
**Access:** Public  
**File:** `server/controllers/paymentController.js`

**Purpose:** Get Razorpay public key for frontend

**Response:**
```json
{
  "key": "rzp_test_...",
  "isCOD": false
}
```

---

### 2. Create Razorpay Order

**Endpoint:** `POST /api/payment/create-order`  
**Access:** Private  
**File:** `server/controllers/paymentController.js`

**Purpose:** Create Razorpay order for payment

**Request Body:**
```json
{
  "amount": 500,
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_...",
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123"
  },
  "key_id": "rzp_test_..."
}
```

**What it does:**
1. Validates amount
2. Creates order in Razorpay
3. Returns order details and key
4. Frontend uses this to open Razorpay checkout

---

### 3. Verify Razorpay Payment

**Endpoint:** `POST /api/payment/verify`  
**Access:** Private  
**File:** `server/controllers/paymentController.js`

**Purpose:** Verify payment signature

**Request Body:**
```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "signature..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_...",
  "orderId": "order_..."
}
```

**What it does:**
1. Generates expected signature
2. Compares with received signature
3. Verifies payment authenticity
4. Returns verification result

---

## 🤖 Chatbot APIs

**Base URL:** `/api/chatbot`

### 1. Chat with Bot

**Endpoint:** `POST /api/chatbot/chat`  
**Access:** Public  
**File:** `server/controllers/chatbotController.js`

**Purpose:** Send message to AI farming assistant

**Request Body:**
```json
{
  "message": "How do I grow tomatoes?"
}
```

**Response:**
```json
{
  "response": "To grow tomatoes, you need to...",
  "suggestions": [
    "Tell me about organic farming",
    "What are the best vegetables to grow?"
  ]
}
```

**What it does:**
1. Sends message to Gemini AI
2. Gets AI response
3. Generates follow-up suggestions
4. Returns response and suggestions

---

### 2. Get Suggestions

**Endpoint:** `GET /api/chatbot/suggestions`  
**Access:** Public  
**File:** `server/controllers/chatbotController.js`

**Purpose:** Get suggested questions

**Response:**
```json
{
  "suggestions": [
    "How do I start organic farming?",
    "What are the best crops for beginners?",
    "Tell me about crop rotation"
  ]
}
```

---

## 📤 Upload APIs

**Base URL:** `/api/upload`

### 1. Upload Image

**Endpoint:** `POST /api/upload`  
**Access:** Public  
**File:** `server/routes/uploadRoutes.js`

**Purpose:** Upload product/farm images

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- File: Image file (jpg, png, etc.)

**Response:**
```json
{
  "message": "Image uploaded",
  "image": "/uploads/image-1234567890.jpg"
}
```

**What it does:**
1. Receives image file
2. Validates file type
3. Saves to `/uploads` folder
4. Returns image path

---

## 🔒 Authentication & Authorization

### JWT Token

All protected routes require JWT token in header:

```
Authorization: Bearer <token>
```

### Middleware

**File:** `server/middleware/authMiddleware.js`

#### 1. protect
- Verifies JWT token
- Attaches user to request
- Used for all private routes

#### 2. requireRole(role)
- Checks if user has specific role
- Used for role-specific routes
- Example: `requireRole('farmer')`, `requireRole('admin')`

---

## 📊 Response Formats

### Success Response

```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "message": "Error message",
  "stack": "Error stack (only in development)"
}
```

---

## 🎯 Summary

### Total APIs: 40+

**By Category:**
- Authentication: 8 APIs
- Products: 6 APIs
- Orders: 6 APIs
- Admin: 12 APIs
- Payment: 3 APIs
- Chatbot: 2 APIs
- Upload: 1 API

### Access Levels:
- **Public:** 10 APIs
- **Private (Any User):** 15 APIs
- **Private (Farmer Only):** 8 APIs
- **Private (Admin Only):** 12 APIs

---

**Last Updated:** May 8, 2026  
**Base URL:** http://localhost:5000/api  
**Authentication:** JWT Bearer Token
