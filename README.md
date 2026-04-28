# Locaura Admin Portal

## Project Overview

Locaura is a comprehensive local delivery platform that connects local stores (retailers) to customers through three main apps:
1. **User & Retailer App** - For customers and store owners
2. **Delivery Partner App** - For delivery personnel
3. **Admin Portal (Website)** - For administrators to manage all aspects

## Admin Portal Responsibilities

The admin portal manages:
- **User Management** - Register users, block/unblock accounts
- **Retailer Management** - Approve/reject stores, verify KYC documents
- **Delivery Partners** - Verify documents, activate/deactivate partners
- **Products & Catalog** - Approve products, manage categories, inventory
- **Orders** - Track orders, change status, assign riders, issue refunds
- **Payments & Settlement** - Process payouts, view revenue, issue adjustments
- **Support** - Handle support tickets, send announcements
- **Settings** - Configure delivery fees, commission, banners, FAQs

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (with Sequelize ORM)
- **Authentication**: JWT
- **Validation**: Express Validator
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Styling**: Emotion (MUI dependency)

## Project Structure

```
locaura-admin/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL configuration
│   │   ├── models/                  # Sequelize models
│   │   │   ├── AdminUser.js         # Admin users
│   │   │   ├── User.js              # Customer users
│   │   │   ├── Retailer.js          # Retailer stores
│   │   │   ├── DeliveryPartner.js   # Delivery personnel
│   │   │   ├── Category.js          # Product categories
│   │   │   ├── Product.js           # Products
│   │   │   ├── Order.js             # Orders
│   │   │   ├── Payment.js           # Payments
│   │   │   ├── SupportTicket.js     # Support tickets
│   │   │   ├── Review.js            # Customer reviews
│   │   │   └── Setting.js           # System settings
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js        # Authentication
│   │   │   ├── userRoutes.js        # User management
│   │   │   ├── retailerRoutes.js    # Retailer management
│   │   │   ├── riderRoutes.js       # Delivery partner management
│   │   │   ├── productRoutes.js     # Product management
│   │   │   ├── orderRoutes.js       # Order management
│   │   │   ├── paymentRoutes.js     # Payment management
│   │   │   ├── supportRoutes.js     # Support management
│   │   │   └── settingsRoutes.js    # Settings management
│   │   ├── controllers/             # Route controllers (to be created)
│   │   ├── middleware/              # Custom middleware
│   │   ├── utils/                   # Utility functions
│   │   └── server.js                # Express server entry point
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosConfig.js       # Axios configuration & interceptors
│   │   │   └── endpoints.js         # API endpoint functions
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Layout.js        # Main layout with sidebar
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Users.js
│   │   │   ├── Retailers.js
│   │   │   ├── DeliveryPartners.js
│   │   │   ├── Products.js
│   │   │   ├── Orders.js
│   │   │   ├── Payments.js
│   │   │   ├── Support.js
│   │   │   └── Settings.js
│   │   ├── context/                 # React Context (for state management)
│   │   ├── styles/                  # Global styles
│   │   ├── index.js                 # React entry point
│   │   ├── index.css                # Global styles
│   │   └── App.js                   # Main App component
│   ├── public/
│   │   └── index.html               # HTML template
│   ├── package.json                 # Dependencies
│   └── .gitignore
│
└── README.md (this file)
```

## Database Schema (PostgreSQL)

### Key Tables:
- **admin_users** - Admin portal users with roles (SuperAdmin, Admin, Support)
- **users** - Customer users
- **retailers** - Store/shop information
- **delivery_partners** - Rider/delivery personnel
- **categories** - Product categories
- **products** - Products with approval workflow
- **orders** - Order information with status tracking
- **payments** - Payment records and settlements
- **support_tickets** - Customer support tickets
- **reviews** - Customer ratings and feedback
- **settings** - System configuration

## API Endpoints Overview

### Authentication
- POST `/api/auth/login` - Admin login
- POST `/api/auth/register` - Create admin account
- POST `/api/auth/logout` - Logout

### Users
- GET `/api/users` - List users
- GET `/api/users/:id` - User details
- PATCH `/api/users/:id/status` - Block/unblock user
- POST `/api/users/:id/notify` - Send notification

### Retailers
- GET `/api/retailers` - List retailers
- POST `/api/retailers/:id/approve` - Approve store
- POST `/api/retailers/:id/reject` - Reject store
- GET `/api/retailers/:id/products` - Store products

### Delivery Partners
- GET `/api/riders` - List riders
- POST `/api/riders/:id/verify` - Verify documents
- POST `/api/riders/:id/toggle-status` - Activate/deactivate

### Products
- GET `/api/products` - List products
- POST `/api/products/:id/approve` - Approve product
- POST `/api/products/:id/reject` - Reject product
- POST `/api/products/bulk/upload` - CSV bulk upload

### Orders
- GET `/api/orders` - List orders
- PUT `/api/orders/:id/status` - Update order status
- POST `/api/orders/:id/cancel` - Cancel order
- POST `/api/orders/:id/reassign-rider` - Reassign delivery partner
- POST `/api/orders/:id/refund` - Issue refund

### Payments
- GET `/api/payments/dashboard` - Payment overview
- GET `/api/payments/payouts` - List payouts
- PUT `/api/payments/payouts/:id/paid` - Mark as paid
- POST `/api/payments/adjustments` - Issue adjustment

### Support
- GET `/api/support/tickets` - List tickets
- PUT `/api/support/tickets/:id/status` - Update ticket
- POST `/api/support/announcements` - Send announcement

### Settings
- GET `/api/settings` - Get all settings
- PUT `/api/settings/:key` - Update setting
- POST `/api/settings/delivery-fees` - Set delivery fees


## Setup Instructions

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure PostgreSQL**
   - Create a PostgreSQL database named `locaura_admin`
   - Update `.env` with your database credentials

3. **Environment variables** (`.env`)
   ```
   NODE_ENV=development
   PORT=5000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=locaura_admin
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=7d
   ```

4. **Run database migrations** (once Sequelize migrations are created)
   ```bash
   npm run migrate
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment variables** (`.env`)
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Application opens at `http://localhost:3000`

## Roles & Permissions

- **SuperAdmin** - Full access to all features
- **Admin** - All features except payouts and user deletions
- **Support** - Only support tickets and messaging

## Features Implemented

✅ Project structure created  
✅ Database models defined  
✅ API routes skeleton created  
✅ Frontend pages and layout created  
✅ Material-UI theme setup  
✅ Axios API client with interceptors  
✅ Authentication middleware  

## Next Steps

1. **Backend Controllers** - Implement controller functions for each route
2. **Database Integration** - Connect models and implement CRUD operations
3. **Data Tables** - Create reusable data table components with pagination/filtering
4. **Forms** - Implement add/edit forms for users, retailers, products, etc.
5. **Authentication** - Integrate JWT login flow
6. **Charts & Analytics** - Implement dashboard analytics
7. **File Uploads** - Implement document and image uploads
8. **Testing** - Add unit and integration tests

## Getting Started

1. Clone/navigate to the project
2. Follow Backend Setup steps
3. Follow Frontend Setup steps
4. Open `http://localhost:3000` in browser
5. Test with dummy credentials (implement authentication first)

---

**Last Updated**: March 10, 2026  
**Status**: Foundation Complete - Ready for Feature Development
"# Locaura-Admin" 
