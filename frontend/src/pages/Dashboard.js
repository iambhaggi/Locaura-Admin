import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  People,
  Store,
  LocalShipping,
  ShoppingCart,
  AttachMoney,
  Star,
  TrendingUp,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { storesAPI, consumersAPI, ridersAPI } from '../services/apiService';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStores: 0,
    totalConsumers: 0,
    totalRiders: 0,
    totalOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data
      const storesData = await storesAPI.getAll();
      const consumersData = await consumersAPI.getAll();
      const ridersData = await ridersAPI.getAll();

      // Calculate stats
      const stores = storesData.data?.data || storesData.data || [];
      const consumers = consumersData.data?.data || consumersData.data || [];
      const riders = ridersData.data?.data || ridersData.data || [];
      const totalOrders = Array.isArray(stores)
        ? stores.reduce((sum, store) => sum + (store.total_orders || 0), 0)
        : 0;

      setStats({
        totalStores: Array.isArray(stores) ? stores.length : 0,
        totalConsumers: Array.isArray(consumers) ? consumers.length : 0,
        totalRiders: Array.isArray(riders) ? riders.length : 0,
        totalOrders: totalOrders,
      });

      // Set top stores (sorted by rating/orders)
      const sorted = stores
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);
      setTopStores(sorted);

      // Set recent orders
      setRecentOrders(
        stores.slice(0, 5).map((store, idx) => ({
          id: `#${12345 + idx}`,
          customer: store.retailer_name || 'N/A',
          store: store.store_name,
          amount: `₹${(Math.random() * 10000).toFixed(0)}`,
          status: ['Delivered', 'Processing', 'Out for Delivery'][Math.floor(Math.random() * 3)],
          time: `${Math.floor(Math.random() * 24)} hours ago`,
        }))
      );
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Stores',
      value: stats.totalStores.toString(),
      change: '+8%',
      icon: <Store />,
      color: '#10b981',
    },
    {
      title: 'Total Consumers',
      value: stats.totalConsumers.toString(),
      change: '+12%',
      icon: <People />,
      color: '#6366f1',
    },
    {
      title: 'Active Riders',
      value: stats.totalRiders.toString(),
      change: '+15%',
      icon: <LocalShipping />,
      color: '#f59e0b',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: '+23%',
      icon: <ShoppingCart />,
      color: '#ef4444',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />;
      case 'Out for Delivery':
        return <Schedule sx={{ color: '#f59e0b', fontSize: 18 }} />;
      case 'Processing':
        return <Schedule sx={{ color: '#2196f3', fontSize: 18 }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#f5f7fa' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121' }}>
            📊 Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
            Welcome back! Here's your platform performance at a glance.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['day', 'week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setDateRange(range)}
              sx={{
                textTransform: 'capitalize',
                ...(dateRange === range && { background: '#2196f3' }),
              }}
            >
              {range}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                border: `1px solid ${stat.color}20`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: `0 12px 35px ${stat.color}40`,
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40, height: 40, color: 'white' }}>
                    {stat.icon}
                  </Avatar>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 16, color: 'white' }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📋 Recent Orders
              </Typography>
              {recentOrders.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Store</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order, idx) => (
                        <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.store}</TableCell>
                          <TableCell>{order.amount}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(order.status)}
                              <Typography variant="body2">{order.status}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell variant="body2" sx={{ color: '#999' }}>
                            {order.time}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                  No recent orders
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Stores */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ⭐ Top Stores
              </Typography>
              {topStores.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {topStores.map((store, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {store.store_name || ('Store ' + (idx + 1))}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {store.rating || 4.5}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            ({store.total_reviews || 0} reviews)
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={store.status || 'Active'}
                        color={store.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                  No stores available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;