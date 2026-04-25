import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Support from './pages/Support';
import Settings from './pages/Settings';
import AdminSettings from './pages/AdminSettings';
import Offers from './pages/Offers';

// Consumer Pages
import AllConsumers from './pages/Consumers/AllConsumers';
import ConsumerAddresses from './pages/Consumers/ConsumerAddresses';
import ConsumerDemographics from './pages/Consumers/ConsumerDemographics';
import ConsumerStatusManagement from './pages/Consumers/ConsumerStatusManagement';
import ConsumersCartHistory from './pages/Consumers/CartHistory';

// Shopping/Carts Pages
import ActiveCarts from './pages/Shopping/ActiveCarts';
import CartHistory from './pages/Shopping/CartHistory';

// Retailer Pages
import AllRetailers from './pages/Retailers/AllRetailers';
import RetailerDetails from './pages/Retailers/RetailerDetails';
import RetailerKYC from './pages/Retailers/RetailerKYC';
import RetailerStatusManagement from './pages/Retailers/RetailerStatusManagement';
import RetailerPerformance from './pages/Retailers/RetailerPerformance';

// Store Pages
import AllStores from './pages/Stores/AllStores';
import StoreLocation from './pages/Stores/StoreLocation';
import StoreBankDetails from './pages/Stores/StoreBankDetails';
import StoreBusinessHours from './pages/Stores/StoreBusinessHours';
import StoreStatusManagement from './pages/Stores/StoreStatusManagement';
import StorePerformance from './pages/Stores/StorePerformance';

// Order Pages
import AllOrders from './pages/Orders/AllOrders';
import OrderTimeline from './pages/Orders/OrderTimeline';
import OrderCancellations from './pages/Orders/OrderCancellations';
import OrderReturn from './pages/Orders/OrderReturn';
import OrderDispute from './pages/Orders/OrderDispute';

// Payment Pages
import AllPayments from './pages/Payments/AllPayments';
import PaymentRefunds from './pages/Payments/PaymentRefunds';

// Rider Pages
import AllRiders from './pages/Riders/AllRiders';
import RiderLocation from './pages/Riders/RiderLocation';
import RiderAvailability from './pages/Riders/RiderAvailability';
import RidersOnline from './pages/Riders/RidersOnline';
import RidersOffline from './pages/Riders/RidersOffline';
import RidersVerified from './pages/Riders/RidersVerified';
import RiderStatusManagement from './pages/Riders/RiderStatusManagement';

// Payout Pages
import RetailerPayouts from './pages/Payouts/RetailerPayouts';
import RiderPayouts from './pages/Payouts/RiderPayouts';

// Product Pages
import AllProducts from './pages/Products/AllProducts';
import ProductVariants from './pages/Products/ProductVariants';
import ProductCategories from './pages/Products/ProductCategories';
import ProductApproval from './pages/Products/ProductApproval';
import ProductStatus from './pages/Products/ProductStatus';
import ProductSearch from './pages/Products/ProductSearch';
import ProductInventory from './pages/Products/ProductInventory';
import ProductTrends from './pages/Products/ProductTrends';

// Review Pages
import AllReviews from './pages/Reviews/AllReviews';
import StoreReviews from './pages/Reviews/StoreReviews';
import ProductReviews from './pages/Reviews/ProductReviews';
import RiderReviews from './pages/Reviews/RiderReviews';
import ReviewModeration from './pages/Reviews/ReviewModeration';
import ReviewAnalytics from './pages/Reviews/ReviewAnalytics';

// Notification Pages
import NotificationManagement from './pages/Notifications/NotificationManagement';
import AllNotifications from './pages/Notifications/AllNotifications';
import ConsumerNotifications from './pages/Notifications/ConsumerNotifications';
import RetailerNotifications from './pages/Notifications/RetailerNotifications';
import RiderNotifications from './pages/Notifications/RiderNotifications';
import NotificationHistory from './pages/Notifications/NotificationHistory';
import FCMManagement from './pages/Notifications/FCMManagement';

// Analytics & Reports
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

// Legacy Pages (Old)
import AppConsumers from './pages/AppConsumers';
import AppCategories from './pages/AppCategories';
import AppRetailers from './pages/AppRetailers';
import AppStores from './pages/AppStores';
import AppProducts from './pages/AppProducts';
import AppOrders from './pages/AppOrders';
import AppPayments from './pages/AppPayments';
import AppReviews from './pages/AppReviews';
import AppRiders from './pages/AppRiders';
import AppRiderEarnings from './pages/AppRiderEarnings';
import AppRiderPayouts from './pages/AppRiderPayouts';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#424242',
      light: '#666666',
      dark: '#212121',
    },
    secondary: {
      main: '#757575',
      light: '#9e9e9e',
      dark: '#424242',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    success: {
      main: '#43a047',
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    error: {
      main: '#e53935',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#fbb040',
      light: '#fdd835',
      dark: '#f57f17',
    },
    info: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#212121',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#212121',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#212121',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#212121',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#212121',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#212121',
    },
    body1: {
      fontSize: '0.95rem',
      color: '#212121',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#757575',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0',
          backgroundColor: '#f9f9f9',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: '#424242',
          color: '#ffffff',
          '&:hover': {
            background: '#616161',
          },
        },
        outlined: {
          borderColor: '#e0e0e0',
          color: '#424242',
          '&:hover': {
            borderColor: '#424242',
            background: '#f5f5f5',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: '#f5f5f5',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#424242',
            borderBottom: '2px solid #e0e0e0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: '#f5f5f5',
            transition: 'all 0.2s ease',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            background: '#ffffff',
            '&:hover': {
              background: '#f9f9f9',
            },
            '&.Mui-focused': {
              background: 'rgba(255,255,255,1)',
              boxShadow: '0 8px 25px rgba(99,102,241,0.2)',
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Router>
          <Routes>
            {/* Login Route - No Layout */}
            <Route path="/login" element={<Login />} />
            
            {/* All other routes - Protected with Layout */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/offers" element={<Offers />} />
                      
                      {/* ============ CONSUMER ROUTES ============ */}
                      <Route path="/consumers" element={<AllConsumers />} />
                      <Route path="/consumers/details" element={<AllConsumers />} />
                      <Route path="/consumers/addresses" element={<ConsumerAddresses />} />
                      <Route path="/consumers/carts" element={<ConsumersCartHistory />} />
                      <Route path="/consumers/status" element={<ConsumerStatusManagement />} />
                      <Route path="/consumers/demographics" element={<ConsumerDemographics />} />
                      
                      {/* ============ RETAILER ROUTES ============ */}
                      <Route path="/retailers" element={<AllRetailers />} />
                      <Route path="/retailers/details" element={<RetailerDetails />} />
                      <Route path="/retailers/kyc" element={<RetailerKYC />} />
                      <Route path="/retailers/status" element={<RetailerStatusManagement />} />
                      <Route path="/retailers/performance" element={<RetailerPerformance />} />
                      
                      {/* ============ STORE ROUTES ============ */}
                      <Route path="/stores" element={<AllStores />} />
                      <Route path="/stores/details" element={<AllStores />} />
                      <Route path="/stores/location" element={<StoreLocation />} />
                      <Route path="/stores/bank" element={<StoreBankDetails />} />
                      <Route path="/stores/hours" element={<StoreBusinessHours />} />
                      <Route path="/stores/status" element={<StoreStatusManagement />} />
                      <Route path="/stores/performance" element={<StorePerformance />} />
                      
                      {/* ============ PRODUCT ROUTES ============ */}
                      <Route path="/products" element={<AllProducts />} />
                      <Route path="/products/details" element={<AllProducts />} />
                      <Route path="/products/variants" element={<ProductVariants />} />
                      <Route path="/categories" element={<ProductCategories />} />
                      <Route path="/products/approval" element={<ProductApproval />} />
                      <Route path="/products/status" element={<ProductStatus />} />
                      <Route path="/products/search" element={<ProductSearch />} />
                      <Route path="/products/inventory" element={<ProductInventory />} />
                      <Route path="/products/trends" element={<ProductTrends />} />
                      
                      {/* ============ SHOPPING CART ROUTES ============ */}
                      <Route path="/carts" element={<ActiveCarts />} />
                      <Route path="/carts/active" element={<ActiveCarts />} />
                      <Route path="/carts/items" element={<ActiveCarts />} />
                      <Route path="/carts/history" element={<CartHistory />} />
                      
                      {/* ============ RIDER ROUTES ============ */}
                      <Route path="/riders" element={<AllRiders />} />
                      <Route path="/riders/details" element={<AllRiders />} />
                      <Route path="/riders/kyc" element={<AllRiders />} />
                      <Route path="/riders/vehicles" element={<AllRiders />} />
                      <Route path="/riders/bank" element={<AllRiders />} />
                      <Route path="/riders/online" element={<RidersOnline />} />
                      <Route path="/riders/offline" element={<RidersOffline />} />
                      <Route path="/riders/verified" element={<RidersVerified />} />
                      <Route path="/riders/location" element={<RiderLocation />} />
                      <Route path="/riders/availability" element={<RiderAvailability />} />
                      <Route path="/riders/status" element={<RiderStatusManagement />} />
                      
                      {/* ============ ORDER ROUTES ============ */}
                      <Route path="/orders" element={<AllOrders />} />
                      <Route path="/orders/details" element={<AllOrders />} />
                      <Route path="/orders/items" element={<AllOrders />} />
                      <Route path="/orders/status" element={<AllOrders />} />
                      <Route path="/orders/timeline" element={<OrderTimeline />} />
                      <Route path="/orders/delivery" element={<AllOrders />} />
                      <Route path="/orders/cancellations" element={<OrderCancellations />} />
                      <Route path="/orders/returns" element={<OrderReturn />} />
                      <Route path="/orders/disputes" element={<OrderDispute />} />
                      
                      {/* ============ PAYMENT ROUTES ============ */}
                      <Route path="/payments" element={<AllPayments />} />
                      <Route path="/payments/details" element={<AllPayments />} />
                      <Route path="/payments/methods" element={<AllPayments />} />
                      <Route path="/payments/razorpay" element={<AllPayments />} />
                      <Route path="/payments/refunds" element={<PaymentRefunds />} />
                      <Route path="/payments/status" element={<AllPayments />} />
                      
                      {/* ============ PAYOUT ROUTES ============ */}
                      <Route path="/payouts/retailers" element={<RetailerPayouts />} />
                      <Route path="/payouts/retailers/pending" element={<RetailerPayouts />} />
                      <Route path="/payouts/retailers/completed" element={<RetailerPayouts />} />
                      <Route path="/payouts/retailers/history" element={<RetailerPayouts />} />
                      <Route path="/payouts/riders" element={<RiderPayouts />} />
                      <Route path="/payouts/riders/earnings" element={<RiderPayouts />} />
                      
                      {/* ============ REVIEW ROUTES ============ */}
                      <Route path="/reviews" element={<AllReviews />} />
                      <Route path="/reviews/details" element={<AllReviews />} />
                      <Route path="/reviews/stores" element={<StoreReviews />} />
                      <Route path="/reviews/products" element={<ProductReviews />} />
                      <Route path="/reviews/riders" element={<RiderReviews />} />
                      <Route path="/reviews/moderation" element={<ReviewModeration />} />
                      <Route path="/reviews/analytics" element={<ReviewAnalytics />} />
                      
                      {/* ============ NOTIFICATION ROUTES ============ */}
                      <Route path="/notifications" element={<NotificationManagement />} />
                      <Route path="/notifications/all" element={<AllNotifications />} />
                      <Route path="/notifications/consumers" element={<ConsumerNotifications />} />
                      <Route path="/notifications/retailers" element={<RetailerNotifications />} />
                      <Route path="/notifications/riders" element={<RiderNotifications />} />
                      <Route path="/notifications/history" element={<NotificationHistory />} />
                      <Route path="/notifications/fcm" element={<FCMManagement />} />
                      
                      {/* ============ ANALYTICS & REPORTS ============ */}
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/reports" element={<Reports />} />
                      
                      {/* ============ LEGACY ROUTES (deprecated) ============ */}
                      <Route path="/app-consumers" element={<AppConsumers />} />
                      <Route path="/app-categories" element={<AppCategories />} />
                      <Route path="/app-retailers" element={<AppRetailers />} />
                      <Route path="/app-stores" element={<AppStores />} />
                      <Route path="/app-products" element={<AppProducts />} />
                      <Route path="/app-orders" element={<AppOrders />} />
                      <Route path="/app-payments" element={<AppPayments />} />
                      <Route path="/app-reviews" element={<AppReviews />} />
                      <Route path="/app-riders" element={<AppRiders />} />
                      <Route path="/app-rider-earnings" element={<AppRiderEarnings />} />
                      <Route path="/app-rider-payouts" element={<AppRiderPayouts />} />
                      
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
