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
      main: '#3366ff',
      light: '#5c7cfa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a855f7',
      dark: '#5b21b6',
    },
    background: {
      default: '#eef5ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#475569',
    },
    success: {
      main: '#16a34a',
      light: '#4ade80',
      dark: '#15803d',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#b91c1c',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#b45309',
    },
    info: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
    },
    divider: '#d1d5db',
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
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#eef5ff',
          minHeight: '100vh',
          backgroundImage: 'radial-gradient(circle at top left, rgba(51,102,255,0.12), transparent 25%), radial-gradient(circle at bottom right, rgba(124,58,237,0.08), transparent 22%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          backgroundColor: '#f8fbff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: 'none',
          fontWeight: 700,
          padding: '10px 24px',
          boxShadow: '0 12px 28px rgba(51, 102, 255, 0.12)',
          transition: 'all 0.35s ease',
          '&:hover': {
            boxShadow: '0 18px 36px rgba(51, 102, 255, 0.18)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #3366ff 0%, #7c3aed 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #1746d2 0%, #5b21b6 100%)',
          },
        },
        outlined: {
          borderColor: '#dbeafe',
          color: '#1d4ed8',
          '&:hover': {
            borderColor: '#7c3aed',
            background: '#eef2ff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'rgba(51,102,255,0.08)',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#1e3a8a',
            borderBottom: '2px solid rgba(148, 163, 184, 0.24)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: 'rgba(51,102,255,0.06)',
            transition: 'all 0.2s ease',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            background: '#ffffff',
            '&:hover': {
              background: '#f3f7ff',
            },
            '&.Mui-focused': {
              background: '#ffffff',
              boxShadow: '0 12px 30px rgba(51, 102, 255, 0.16)',
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
