# Product Requirements Document (PRD): Food Rescue Backend

## 1. Product Overview
Food Rescue is a platform designed to bridge restaurants (Merchants) and customers to purchase surplus food at discounted prices, aiming to prevent food waste. The backend system serves as the core API, handling business logic, data persistence, real-time communication, and secure access control.

## 2. Target Audience & Roles
- **Customer**: Regular users who can browse food items, view restaurant profiles, place orders (checkout), and leave reviews.
- **Merchant (Restaurant Owner)**: Users with a registered restaurant profile. They can upload food products, initiate flash sales, manage order statuses, and receive real-time notifications for new orders.

## 3. Core Features & Requirements

### 3.1 Authentication & Authorization
- **Registration & Login**: Secure user onboarding and login.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Customers and Merchants. Endpoint-specific middleware ensures only authorized roles can perform certain actions (e.g., `isMerchant`).
- **Security**: JWT-based authentication via HTTP Headers and Cookies. Passwords must be securely encrypted using bcrypt.

### 3.2 Product Management
- **Inventory Control**: Merchants can add surplus food items, including uploading product images. Images are processed using Multer and stored in Cloudinary.
- **Stock Management**: Ensure accurate stock levels to prevent overselling phenomena.

### 3.3 Order Flow & Transaction Management
- **Order Placement**: Customers can checkout and purchase food.
- **Validation**: System must validate stock availability before confirming an order.
- **Database Transactions (ACID)**: Deducting stock and creating an order record must be handled in a single transaction (using Prisma `$transaction`). Rollbacks occur if any step fails to ensure data consistency.
- **Dynamic Fee Calculation**: The platform dynamically calculates and applies a 5% commission fee to the buyer if the restaurant's total revenue exceeds Rp 500,000.
- **Order Lifecycle**: Statuses move sequentially: `WAITING_PAYMENT` -> `PREPARING` -> `READY_FOR_PICKUP` / `ON_THE_WAY` -> `COMPLETED`.
- **Order Cancellation**: If an order is cancelled (`CANCELLED`), stock is automatically restored to the system.
- **Order Completion**: Revenue is added to the restaurant's total revenue based on the net profit of the completed order.

### 3.4 Real-Time Notifications
- **WebSocket Integration**: Merchants receive instant `new_order` notifications via Socket.io to begin food preparation immediately without polling the server.

### 3.5 Reviews & Ratings Controlled Flow
- **Eligibility**: Customers can only leave a review for completed orders (`COMPLETED`).
- **Spam Prevention Constraints**: 
  - Maximum of one review per order.
  - Customers are limited to editing their review a maximum of 1 time.
  - Reviews cannot be edited once 30 days have passed since the order.

## 4. Technical Architecture & Stack
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma for object-relational mapping and type-safe database queries.
- **Real-time Engine**: Socket.io
- **Media Storage**: Cloudinary for optimized image storage.

## 5. API Endpoints Highlight
- **Auth**: 
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Products**: 
  - `GET /api/products` (Includes pagination)
  - `POST /api/products` (Merchant only)
- **Orders**: 
  - `POST /api/orders` (Customer creates order)
  - `PUT /api/orders/:id/status` (Merchant updates order status)
- **Reviews**: 
  - `POST /api/reviews/create` (Customer leaves rating)
  - `GET /api/reviews/restaurant/:restaurantId` (Fetch reviews/analytics for a restaurant)
