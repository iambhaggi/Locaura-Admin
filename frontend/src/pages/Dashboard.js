import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
} from '@mui/material';
import {
  People,
  Store,
  LocalShipping,
  ShoppingCart,
  AttachMoney,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { storesAPI, consumersAPI, ridersAPI, ordersAPI, productsAPI, paymentsAPI, retailersAPI } from '../services/apiService';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStores: 0,
    totalConsumers: 0,
    totalRiders: 0,
    totalOrders: 0,
    revenue: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalPayments: 0,
    totalRetailers: 0,
    pendingStores: 0,
    pendingRiders: 0,
    newStores: 0,
    newUsers: 0,
    lowStockProducts: 0,
    refundIssues: 0,
  });
  const [orders, setOrders] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [allConsumers, setAllConsumers] = useState([]);
  const [allRiders, setAllRiders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [allRetailers, setAllRetailers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topStoresBySales, setTopStoresBySales] = useState([]);
  const [recentRidersOnboarded, setRecentRidersOnboarded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('year');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data
      const storesData = await storesAPI.getAll({ limit: 1000 });
      const consumersData = await consumersAPI.getAll({ limit: 1000 });
      const ridersData = await ridersAPI.getAll({ limit: 1000 });
      const ordersData = await ordersAPI.getAll({ limit: 1000 });
      const productsData = await productsAPI.getAll({ limit: 1000 });
      const paymentsData = await paymentsAPI.getAll({ limit: 1000 });
      const retailersData = await retailersAPI.getAll({ limit: 1000 });
      const pendingStoresData = await storesAPI.getPending({ limit: 1000 });
      const pendingRidersData = await ridersAPI.getPending({ limit: 1000 });

      const stores = storesData.data?.data || storesData.data || [];
      const consumers = consumersData.data?.data || consumersData.data || [];
      const riders = ridersData.data?.data || ridersData.data || [];
      const orders = ordersData.data?.data || ordersData.data || [];
      const products = productsData.data?.data || productsData.data || [];
      const payments = paymentsData.data?.data || paymentsData.data || [];
      const retailers = retailersData.data?.data || retailersData.data || [];
      const pendingStores = pendingStoresData.data?.pagination?.total ?? 0;
      const pendingRiders = pendingRidersData.data?.pagination?.total ?? 0;

      setAllStores(stores);
      setAllConsumers(consumers);
      setAllRiders(riders);
      setOrders(orders);
      setAllProducts(products);
      setAllPayments(payments);
      setAllRetailers(retailers);

      setStats((prev) => ({
        ...prev,
        pendingStores,
        pendingRiders,
      }));
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
      value: stats.totalStores.toLocaleString(),
      change: '+8%',
      icon: <Store />,
      color: '#10b981',
    },
    {
      title: 'Total Consumers',
      value: stats.totalConsumers.toLocaleString(),
      change: '+12%',
      icon: <People />,
      color: '#6366f1',
    },
    {
      title: 'Active Riders',
      value: stats.totalRiders.toLocaleString(),
      change: '+15%',
      icon: <LocalShipping />,
      color: '#f59e0b',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+23%',
      icon: <ShoppingCart />,
      color: '#ef4444',
    },
    {
      title: 'Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      change: '+18%',
      icon: <AttachMoney />,
      color: '#0f766e',
    },
    {
      title: 'Avg Order',
      value: `₹${stats.avgOrderValue.toFixed(0)}`,
      change: '+9%',
      icon: <AttachMoney />,
      color: '#8b5cf6',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders.toLocaleString(),
      change: '+5%',
      icon: <CheckCircle />,
      color: '#22c55e',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toLocaleString(),
      change: '+0%',
      icon: <Schedule />,
      color: '#0ea5e9',
    },
    {
      title: 'Pending Approvals',
      value: `${stats.pendingStores} stores / ${stats.pendingRiders} riders`,
      change: '+0%',
      icon: <Warning />,
      color: '#f97316',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toLocaleString(),
      change: '+6%',
      icon: <AttachMoney />,
      color: '#8b5cf6',
    },
    {
      title: 'Payments',
      value: stats.totalPayments.toLocaleString(),
      change: '+10%',
      icon: <AttachMoney />,
      color: '#14b8a6',
    },
    {
      title: 'Retailers',
      value: stats.totalRetailers.toLocaleString(),
      change: '+5%',
      icon: <Store />,
      color: '#0f766e',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />;
      case 'out for delivery':
      case 'out_for_delivery':
      case 'shipped':
        return <Schedule sx={{ color: '#f59e0b', fontSize: 18 }} />;
      case 'processing':
      case 'pending':
      case 'confirmed':
        return <Schedule sx={{ color: '#2196f3', fontSize: 18 }} />;
      case 'cancelled':
      case 'rejected':
        return <Warning sx={{ color: '#ef4444', fontSize: 18 }} />;
      default:
        return null;
    }
  };

  const getItemDate = useCallback((item) => {
    const dateValue = item?.createdAt ?? item?.created_at ?? item?.updatedAt ?? item?.updated_at;
    return dateValue ? new Date(dateValue) : null;
  }, []);

  const filterByDateRange = useCallback((items, range) => {
    const now = new Date();
    const days = {
      day: 1,
      week: 7,
      month: 30,
      year: 365,
    }[range] || 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return items
      .filter((item) => {
        const itemDate = getItemDate(item);
        return itemDate && itemDate >= cutoff;
      })
      .sort((a, b) => new Date(getItemDate(b)) - new Date(getItemDate(a)));
  }, [getItemDate]);

  const applyDateRangeFilter = useCallback(() => {
    const filteredStores = filterByDateRange(allStores, dateRange);
    const filteredConsumers = filterByDateRange(allConsumers, dateRange);
    const filteredRiders = filterByDateRange(allRiders, dateRange);
    const filteredOrders = filterByDateRange(orders, dateRange);
    const filteredProducts = filterByDateRange(allProducts, dateRange);
    const filteredPayments = filterByDateRange(allPayments, dateRange);
    const filteredRetailers = filterByDateRange(allRetailers, dateRange);

    const revenue = filteredOrders.reduce((sum, order) => sum + (order.pricing?.total ?? 0), 0);
    const completedOrders = filteredOrders.filter((order) =>
      ['delivered', 'completed'].includes(order.status?.toLowerCase())
    ).length;
    const pendingOrders = filteredOrders.filter((order) =>
      ['pending', 'processing', 'confirmed'].includes(order.status?.toLowerCase())
    ).length;
    const avgOrderValue = filteredOrders.length ? revenue / filteredOrders.length : 0;
    const lowStockProducts = filteredProducts.filter((product) =>
      (product.stock_quantity ?? product.total_stock ?? 0) < 10
    ).length;
    const refundIssues = filteredPayments.filter((payment) =>
      (payment.refund_amount ?? 0) > 0 || payment.refunded_at
    ).length;
    const newStores = filteredStores.length;
    const newUsers = filteredConsumers.length;

    const salesByStore = filteredOrders.reduce((map, order) => {
      const storeKey = typeof order.store_id === 'object'
        ? order.store_id._id || order.store_id.store_name || 'Unknown'
        : order.store_id || 'Unknown';
      const storeName = typeof order.store_id === 'object'
        ? order.store_id.store_name || storeKey
        : order.store_id;
      const current = map[storeKey] || { storeName, totalSales: 0, orders: 0 };
      current.totalSales += order.pricing?.total ?? 0;
      current.orders += 1;
      map[storeKey] = current;
      return map;
    }, {});

    const topStoresBySales = Object.values(salesByStore)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    const recentRidersOnboarded = filteredRiders
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
      .slice(0, 5)
      .map((rider) => ({
        name: rider.name || rider.full_name || rider.phone || rider._id,
        joinedAt: getItemDate(rider)?.toLocaleDateString() || 'N/A',
        status: rider.status || 'active',
      }));

    setStats((prev) => ({
      ...prev,
      totalStores: filteredStores.length,
      totalConsumers: filteredConsumers.length,
      totalRiders: filteredRiders.length,
      totalOrders: filteredOrders.length,
      revenue,
      avgOrderValue,
      completedOrders,
      pendingOrders,
      totalProducts: filteredProducts.length,
      totalPayments: filteredPayments.length,
      totalRetailers: filteredRetailers.length,
      pendingStores: filteredStores.filter((store) => store.status === 'pending').length,
      pendingRiders: filteredRiders.filter((rider) => rider.status === 'pending').length,
      lowStockProducts,
      refundIssues,
      newStores,
      newUsers,
    }));

    setTopStoresBySales(topStoresBySales);

    setRecentOrders(
      filteredOrders.slice(0, 5).map((order) => ({
        id: order.order_number || order._id || '—',
        customer:
          typeof order.consumer_id === 'object'
            ? order.consumer_id.name || order.consumer_id._id
            : order.consumer_id || 'N/A',
        store:
          typeof order.store_id === 'object'
            ? order.store_id.store_name || order.store_id._id
            : order.store_id || 'N/A',
        amount: `₹${order.pricing?.total ?? 0}`,
        status: order.status || 'pending',
        time: getItemDate(order)
          ? getItemDate(order).toLocaleString()
          : 'N/A',
      }))
    );

    setRecentRidersOnboarded(recentRidersOnboarded);
  }, [allStores, allConsumers, allRiders, allProducts, allPayments, allRetailers, orders, dateRange, filterByDateRange, getItemDate]);

  useEffect(() => {
    applyDateRangeFilter();
  }, [applyDateRangeFilter]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'transparent' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, mb: 3 }}>
          <Box sx={{ maxWidth: 700 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, maxWidth: 640 }}>
              Fast, clean insight for the admin team. Monitor store performance, order flow, rider onboarding and pending approvals in one polished view.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['Live overview', 'Revenue growth', 'Approval tracking', 'Sales health'].map((label) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  sx={{
                    background: 'rgba(51, 102, 255, 0.08)',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['day', 'week', 'month', 'year'].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setDateRange(range)}
                sx={{
                  textTransform: 'capitalize',
                  minWidth: 92,
                }}
              >
                {range}
              </Button>
            ))}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {[
            {
              label: 'Revenue',
              value: `₹${stats.revenue.toLocaleString()}`,
              icon: <AttachMoney sx={{ color: '#0f766e' }} />,
            },
            {
              label: 'Total Orders',
              value: stats.totalOrders.toLocaleString(),
              icon: <ShoppingCart sx={{ color: '#ef4444' }} />,
            },
            {
              label: 'Active Riders',
              value: stats.totalRiders.toLocaleString(),
              icon: <LocalShipping sx={{ color: '#f59e0b' }} />,
            },
            {
              label: 'New Stores',
              value: stats.newStores.toLocaleString(),
              icon: <Store sx={{ color: '#6366f1' }} />,
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 3, p: 2, minHeight: 126, border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'rgba(51, 102, 255, 0.08)', color: 'primary.main', width: 36, height: 36 }}>
                      {item.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            title: 'Pending Store Approvals',
            value: stats.pendingStores,
            color: '#f97316',
          },
          {
            title: 'Pending Rider Approvals',
            value: stats.pendingRiders,
            color: '#0ea5e9',
          },
          {
            title: 'Low Stock Products',
            value: stats.lowStockProducts,
            color: '#f43f5e',
          },
          {
            title: 'Refund / Dispute Alerts',
            value: stats.refundIssues,
            color: '#a855f7',
          },
        ].map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ backgroundColor: item.color, color: '#fff' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                backgroundColor: '#ffffff',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Avatar sx={{ backgroundColor: `${stat.color}20`, color: stat.color, width: 40, height: 40 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {stat.change}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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

        {/* Top Stores and Recent Riders */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ⭐ Top Stores by Sales
              </Typography>
              {topStoresBySales.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {topStoresBySales.map((store, idx) => (
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
                          {store.storeName || `Store ${idx + 1}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#555' }}>
                          ₹{store.totalSales.toLocaleString()} from {store.orders} orders
                        </Typography>
                      </Box>
                      <Chip label={`#${idx + 1}`} size="small" />
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

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🚴 Recent Riders Onboarded
              </Typography>
              {recentRidersOnboarded.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentRidersOnboarded.map((rider, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {rider.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#555' }}>
                        Joined {rider.joinedAt} • {rider.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                  No recent riders found
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
