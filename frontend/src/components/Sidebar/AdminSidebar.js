import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Inventory as ProductIcon,
  LocalShipping as DeliveryIcon,
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  AccountBalance as PayoutIcon,
  Star as ReviewIcon,
  Notifications as NotificationIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  VerifiedUser as KycIcon,
  LocationOn as LocationIcon,
  Description as DocIcon,
  TrendingUp as AnalyticsIcon,
  Assignment as TaskIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for expanded menu items - all start collapsed
  const [expandedMenus, setExpandedMenus] = useState({
    consumers: false,
    retailers: false,
    stores: false,
    products: false,
    carts: false,
    deliveryPartners: false,
    orders: false,
    payments: false,
    payouts: false,
    reviews: false,
    notifications: false,
  });

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const MenuSection = ({ title, icon, items, expanded, onToggle }) => (
    <>
      <ListItem
        button
        onClick={onToggle}
        sx={{
          backgroundColor: expanded ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
          borderLeft: expanded ? '4px solid #2196F3' : 'none',
          paddingLeft: expanded ? '12px' : '16px',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.15)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: '40px', color: '#2196F3' }}>{icon}</ListItemIcon>
        <ListItemText
          primary={title}
          sx={{
            fontWeight: expanded ? 'bold' : 500,
            fontSize: '14px',
          }}
        />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleNavigate(item.path)}
              sx={{
                paddingLeft: '48px',
                paddingRight: '16px',
                backgroundColor: isActive(item.path)
                  ? 'rgba(33, 150, 243, 0.25)'
                  : 'transparent',
                borderLeft: isActive(item.path) ? '4px solid #1976D2' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: '32px', color: '#1976D2' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  fontSize: '12px',
                  fontWeight: isActive(item.path) ? 'bold' : 400,
                  color: isActive(item.path) ? '#1976D2' : '#555',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          padding: '20px',
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
          🎯 Locaura Admin
        </Typography>
        <Typography variant="caption">Control Center</Typography>
      </Box>

      <Divider />

      {/* Scrollable Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', paddingTop: '10px' }}>
        <List>
          {/* Dashboard */}
          <ListItem
            button
            onClick={() => handleNavigate('/dashboard')}
            sx={{
              backgroundColor: isActive('/dashboard') ? 'rgba(33, 150, 243, 0.25)' : 'transparent',
              borderLeft: isActive('/dashboard') ? '4px solid #1976D2' : 'none',
              paddingLeft: isActive('/dashboard') ? '12px' : '16px',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.15)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px', color: '#2196F3' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" sx={{ fontWeight: '500' }} />
          </ListItem>

          <Divider sx={{ margin: '10px 0' }} />

          {/* CONSUMERS */}
          <MenuSection
            title="👥 Consumers"
            icon={<PeopleIcon />}
            items={[
              { label: 'All Consumers', path: '/consumers', icon: <PeopleIcon /> },
              { label: 'Consumer Details', path: '/consumers/details', icon: <DocIcon /> },
              { label: 'Consumer Addresses', path: '/consumers/addresses', icon: <LocationIcon /> },
              { label: 'Cart History', path: '/consumers/carts', icon: <OrderIcon /> },
              { label: 'Status Management', path: '/consumers/status', icon: <TaskIcon /> },
            ]}
            expanded={expandedMenus.consumers}
            onToggle={() => toggleMenu('consumers')}
          />

          <Divider sx={{ margin: '10px 0' }} />

          {/* RETAILERS & STORES */}
          <MenuSection
            title="🏪 Retailers"
            icon={<StoreIcon />}
            items={[
              { label: 'All Retailers', path: '/retailers', icon: <StoreIcon /> },
              { label: 'Retailer Details', path: '/retailers/details', icon: <DocIcon /> },
              { label: 'KYC Verification', path: '/retailers/kyc', icon: <KycIcon /> },
              { label: 'Status Management', path: '/retailers/status', icon: <TaskIcon /> },
            ]}
            expanded={expandedMenus.retailers}
            onToggle={() => toggleMenu('retailers')}
          />

          <MenuSection
            title="🏬 Stores"
            icon={<HomeIcon />}
            items={[
              { label: 'All Stores', path: '/stores', icon: <StoreIcon /> },
              { label: 'Store Details', path: '/stores/details', icon: <DocIcon /> },
              { label: 'Address & Location', path: '/stores/location', icon: <LocationIcon /> },
              { label: 'Bank Details', path: '/stores/bank', icon: <PaymentIcon /> },
              { label: 'Business Hours', path: '/stores/hours', icon: <TaskIcon /> },
              { label: 'Status Management', path: '/stores/status', icon: <AnalyticsIcon /> },
              { label: 'Performance', path: '/stores/performance', icon: <AnalyticsIcon /> },
            ]}
            expanded={expandedMenus.stores}
            onToggle={() => toggleMenu('stores')}
          />

          <Divider sx={{ margin: '10px 0' }} />

          {/* PRODUCTS & CATALOG */}
          <MenuSection
            title="📦 Products"
            icon={<ProductIcon />}
            items={[
              { label: 'Parent Products', path: '/products', icon: <ProductIcon /> },
              { label: 'Product Variants', path: '/products/variants', icon: <ProductIcon /> },
              { label: 'Categories', path: '/categories', icon: <CategoryIcon /> },
              { label: 'Approval Queue', path: '/products/approval', icon: <KycIcon /> },
              { label: 'Product Status', path: '/products/status', icon: <TaskIcon /> },
              { label: 'Search & Filter', path: '/products/search', icon: <DocIcon /> },
            ]}
            expanded={expandedMenus.products}
            onToggle={() => toggleMenu('products')}
          />

          <MenuSection
            title="🛒 Shopping"
            icon={<OrderIcon />}
            items={[
              { label: 'Active Carts', path: '/carts/active', icon: <OrderIcon /> },
              { label: 'Cart Items', path: '/carts/items', icon: <ProductIcon /> },
              { label: 'Cart History', path: '/carts/history', icon: <AnalyticsIcon /> },
            ]}
            expanded={expandedMenus.carts}
            onToggle={() => toggleMenu('carts')}
          />

          <Divider sx={{ margin: '10px 0' }} />

          {/* DELIVERY & ORDERS */}
          <MenuSection
            title="🚚 Delivery Partners"
            icon={<DeliveryIcon />}
            items={[
              { label: 'All Riders', path: '/riders', icon: <DeliveryIcon /> },
              { label: 'Rider Approval Queue', path: '/riders/status', icon: <KycIcon /> },
              { label: 'Online Riders', path: '/riders/online', icon: <DeliveryIcon /> },
              { label: 'Offline Riders', path: '/riders/offline', icon: <DeliveryIcon /> },
              { label: 'Verified Riders', path: '/riders/verified', icon: <DeliveryIcon /> },
              { label: 'KYC Verification', path: '/riders/kyc', icon: <KycIcon /> },
              { label: 'Location Tracking', path: '/riders/location', icon: <LocationIcon /> },
              { label: 'Availability', path: '/riders/availability', icon: <TaskIcon /> },
            ]}
            expanded={expandedMenus.deliveryPartners}
            onToggle={() => toggleMenu('deliveryPartners')}
          />

          <MenuSection
            title="📋 Orders"
            icon={<OrderIcon />}
            items={[
              { label: 'All Orders', path: '/orders', icon: <OrderIcon /> },
              { label: 'Order Timeline', path: '/orders/timeline', icon: <TaskIcon /> },
              { label: 'Cancellations', path: '/orders/cancellations', icon: <DocIcon /> },
              { label: 'Returns', path: '/orders/returns', icon: <DocIcon /> },
              { label: 'Disputes', path: '/orders/disputes', icon: <DocIcon /> },
            ]}
            expanded={expandedMenus.orders}
            onToggle={() => toggleMenu('orders')}
          />

          <Divider sx={{ margin: '10px 0' }} />

          {/* PAYMENTS & PAYOUTS */}
          <MenuSection
            title="💳 Payments"
            icon={<PaymentIcon />}
            items={[
              { label: 'All Payments', path: '/payments', icon: <PaymentIcon /> },
              { label: 'Refunds', path: '/payments/refunds', icon: <TaskIcon /> },
            ]}
            expanded={expandedMenus.payments}
            onToggle={() => toggleMenu('payments')}
          />

          <MenuSection
            title="💰 Payouts"
            icon={<PayoutIcon />}
            items={[
              { label: 'Retailer Payouts', path: '/payouts/retailers', icon: <PayoutIcon /> },
              { label: 'Pending Payouts', path: '/payouts/retailers/pending', icon: <TaskIcon /> },
              { label: 'Completed Payouts', path: '/payouts/retailers/completed', icon: <KycIcon /> },
              { label: 'Payout History', path: '/payouts/retailers/history', icon: <AnalyticsIcon /> },
              { label: 'Rider Payouts', path: '/payouts/riders', icon: <DeliveryIcon /> },
              { label: 'Rider Earnings', path: '/payouts/riders/earnings', icon: <ProductIcon /> },
            ]}
            expanded={expandedMenus.payouts}
            onToggle={() => toggleMenu('payouts')}
          />

          <Divider sx={{ margin: '10px 0' }} />

          {/* REVIEWS & NOTIFICATIONS */}
          <MenuSection
            title="⭐ Reviews"
            icon={<ReviewIcon />}
            items={[
              { label: 'All Reviews', path: '/reviews', icon: <ReviewIcon /> },
              { label: 'Review Details', path: '/reviews/details', icon: <DocIcon /> },
              { label: 'Store Reviews', path: '/reviews/stores', icon: <StoreIcon /> },
              { label: 'Product Reviews', path: '/reviews/products', icon: <ProductIcon /> },
              { label: 'Rider Reviews', path: '/reviews/riders', icon: <DeliveryIcon /> },
              { label: 'Moderation', path: '/reviews/moderation', icon: <KycIcon /> },
            ]}
            expanded={expandedMenus.reviews}
            onToggle={() => toggleMenu('reviews')}
          />
          {/* OFFERS & NOTIFICATIONS */}
          <ListItem
            button
            onClick={() => handleNavigate('/offers')}
            sx={{
              backgroundColor: isActive('/offers') ? 'rgba(33, 150, 243, 0.25)' : 'transparent',
              borderLeft: isActive('/offers') ? '4px solid #1976D2' : 'none',
              paddingLeft: isActive('/offers') ? '12px' : '16px',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.15)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px', color: '#f5576c' }}>
              <OfferIcon />
            </ListItemIcon>
            <ListItemText primary="🎁 Offers & Deals" sx={{ fontWeight: '500' }} />
          </ListItem>
          <MenuSection
            title="📢 Notifications"
            icon={<NotificationIcon />}
            items={[
              { label: 'All Notifications', path: '/notifications', icon: <NotificationIcon /> },
              { label: 'Consumer Notifications', path: '/notifications/consumers', icon: <PeopleIcon /> },
              { label: 'Retailer Notifications', path: '/notifications/retailers', icon: <StoreIcon /> },
              { label: 'Rider Notifications', path: '/notifications/riders', icon: <DeliveryIcon /> },
              { label: 'Notification History', path: '/notifications/history', icon: <AnalyticsIcon /> },
              { label: 'FCM Integration', path: '/notifications/fcm', icon: <TaskIcon /> },
            ]}
            expanded={expandedMenus.notifications}
            onToggle={() => toggleMenu('notifications')}
          />

          <Divider sx={{ margin: '10px 0' }} />

          {/* ADMIN CONTROL PANEL */}
          <ListItem
            button
            onClick={() => handleNavigate('/admin/settings')}
            sx={{
              backgroundColor: isActive('/admin/settings') ? 'rgba(33, 150, 243, 0.25)' : 'transparent',
              borderLeft: isActive('/admin/settings') ? '4px solid #1976D2' : 'none',
              paddingLeft: isActive('/admin/settings') ? '12px' : '16px',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.15)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px', color: '#FF6F00' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="🎛️ Admin Settings" sx={{ fontWeight: '500' }} />
          </ListItem>
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ padding: '15px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Locaura Admin v1.0
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', marginTop: '5px', color: '#999' }}>
          © 2026 All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderRight: '1px solid #e0e0e0',
          boxShadow: isMobile ? '0 8px 16px rgba(0,0,0,0.15)' : 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
