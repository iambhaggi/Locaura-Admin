import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  Star,
  LocalShipping,
  Schedule,
} from '@mui/icons-material';

const StorePerformanceDialog = ({ open, store, onClose }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && store) {
      // Simulate loading performance data
      setLoading(true);
      setTimeout(() => {
        const data = {
          totalOrders: Math.floor(Math.random() * 1000) + 500,
          totalRevenue: Math.floor(Math.random() * 100000) + 50000,
          avgOrderValue: Math.floor(Math.random() * 500) + 200,
          avgRating: (Math.random() * 1.5 + 3.5).toFixed(1),
          totalReviews: Math.floor(Math.random() * 200) + 50,
          avgDeliveryTime: Math.floor(Math.random() * 20) + 25,
          completionRate: Math.floor(Math.random() * 10) + 90,
          returnRate: (Math.random() * 3 + 1).toFixed(1),
          monthlyGrowth: (Math.random() * 20 - 10).toFixed(1),
          topProducts: [
            { name: 'Premium Rice', sales: 156, revenue: 23400 },
            { name: 'Organic Vegetables', sales: 134, revenue: 18900 },
            { name: 'Fresh Fruits', sales: 98, revenue: 14700 },
            { name: 'Dairy Products', sales: 87, revenue: 12300 },
            { name: 'Spices & Herbs', sales: 76, revenue: 9800 },
          ],
          weeklyStats: [
            { day: 'Mon', orders: 45, revenue: 6750 },
            { day: 'Tue', orders: 52, revenue: 7800 },
            { day: 'Wed', orders: 38, revenue: 5700 },
            { day: 'Thu', orders: 61, revenue: 9150 },
            { day: 'Fri', orders: 73, revenue: 10950 },
            { day: 'Sat', orders: 89, revenue: 13350 },
            { day: 'Sun', orders: 67, revenue: 10050 },
          ]
        };
        setPerformanceData(data);
        setLoading(false);
      }, 1500);
    }
  }, [open, store]);

  const getGrowthIcon = (growth) => {
    return parseFloat(growth) >= 0 ? 
      <TrendingUp sx={{ color: 'success.main' }} /> : 
      <TrendingDown sx={{ color: 'error.main' }} />;
  };

  const getGrowthColor = (growth) => {
    return parseFloat(growth) >= 0 ? 'success.main' : 'error.main';
  };

  if (!store) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Performance Analytics: {store.store_name}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>Loading Performance Data...</Typography>
            <LinearProgress />
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            {/* Key Metrics */}
            <Typography variant="h6" gutterBottom>Key Performance Metrics</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2">Total Orders</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {performanceData.totalOrders}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getGrowthIcon(performanceData.monthlyGrowth)}
                      <Typography 
                        variant="caption" 
                        sx={{ ml: 0.5, color: getGrowthColor(performanceData.monthlyGrowth) }}
                      >
                        {performanceData.monthlyGrowth}% this month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2">Total Revenue</Typography>
                    </Box>
                    <Typography variant="h4" color="success.main">
                      ₹{performanceData.totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Order: ₹{performanceData.avgOrderValue}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle2">Customer Rating</Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main">
                      {performanceData.avgRating}⭐
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {performanceData.totalReviews} reviews
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalShipping sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="subtitle2">Delivery Time</Typography>
                    </Box>
                    <Typography variant="h4" color="info.main">
                      {performanceData.avgDeliveryTime}m
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average delivery
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Performance Indicators */}
            <Typography variant="h6" gutterBottom>Performance Indicators</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Order Completion Rate</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" sx={{ mr: 1 }}>
                        {performanceData.completionRate}%
                      </Typography>
                      <Chip 
                        label={performanceData.completionRate >= 95 ? 'Excellent' : 'Good'} 
                        color={performanceData.completionRate >= 95 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={performanceData.completionRate} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Return Rate</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" sx={{ mr: 1 }}>
                        {performanceData.returnRate}%
                      </Typography>
                      <Chip 
                        label={parseFloat(performanceData.returnRate) <= 2 ? 'Low' : 'Moderate'} 
                        color={parseFloat(performanceData.returnRate) <= 2 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(performanceData.returnRate) * 10} 
                      color={parseFloat(performanceData.returnRate) <= 2 ? 'success' : 'warning'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Monthly Growth</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" sx={{ mr: 1, color: getGrowthColor(performanceData.monthlyGrowth) }}>
                        {performanceData.monthlyGrowth}%
                      </Typography>
                      {getGrowthIcon(performanceData.monthlyGrowth)}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Compared to last month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Top Products */}
            <Typography variant="h6" gutterBottom>Top Performing Products</Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Units Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          {index === 0 && <Chip label="Best Seller" color="success" size="small" sx={{ ml: 1 }} />}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{product.sales}</TableCell>
                      <TableCell align="right">₹{product.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <LinearProgress 
                          variant="determinate" 
                          value={(product.sales / performanceData.topProducts[0].sales) * 100} 
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Weekly Performance */}
            <Typography variant="h6" gutterBottom>Weekly Performance</Typography>
            <Grid container spacing={1}>
              {performanceData.weeklyStats.map((day, index) => (
                <Grid item xs key={index}>
                  <Card sx={{ textAlign: 'center', minHeight: 120 }}>
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {day.day}
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '1rem', my: 1 }}>
                        {day.orders}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ₹{day.revenue.toLocaleString()}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(day.orders / Math.max(...performanceData.weeklyStats.map(d => d.orders))) * 100}
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained">Export Report</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorePerformanceDialog;