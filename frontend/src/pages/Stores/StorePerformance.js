import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Container,
  Rating,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { storesAPI, ordersAPI } from '../../services/apiService';

const StorePerformance = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [storesRes, ordersRes] = await Promise.all([
          storesAPI.getAll(),
          ordersAPI.getAll({ limit: 1000 }),
        ]);

        const storesData = storesRes?.data?.data || storesRes?.data || [];
        const ordersData = ordersRes?.data?.data || ordersRes?.data || [];

        const performanceRows = storesData.map((store) => {
          const storeOrders = ordersData.filter((order) => String(order.store_id) === String(store._id));
          const deliveredOrders = storeOrders.filter((order) => ['delivered', 'completed'].includes((order.status || '').toLowerCase()));
          const onTimeOrders = deliveredOrders.filter((order) => {
            if (!order.delivered_at || !order.estimated_delivery_at) return false;
            return new Date(order.delivered_at) <= new Date(order.estimated_delivery_at);
          });

          const totalOrders = storeOrders.length;
          const totalRevenue = storeOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
          const onTimePct = deliveredOrders.length > 0
            ? `${Math.round((onTimeOrders.length / deliveredOrders.length) * 100)}%`
            : '0%';

          return {
            _id: store._id,
            store_name: store.store_name || '-',
            rating: Number(store.rating || 0),
            total_reviews: Number(store.total_reviews || 0),
            total_orders: totalOrders,
            total_revenue: totalRevenue,
            on_time_delivery: onTimePct,
            avg_delivery_time: '-',
            customer_satisfaction: `${Math.round(((Number(store.rating || 0) / 5) * 100) || 0)}%`,
            return_rate: '0%',
            month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          };
        });

        setStores(performanceRows);
      } catch (err) {
        setError('Failed to fetch performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  const filteredStores = stores.filter((store) =>
    (store.store_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 4.0) return '#8bc34a';
    if (rating >= 3.5) return '#ffc107';
    return '#ff9800';
  };

  const getPerformanceColor = (percentage) => {
    const num = parseInt(percentage);
    if (num >= 95) return '#4caf50';
    if (num >= 90) return '#8bc34a';
    if (num >= 85) return '#ffc107';
    return '#ff9800';
  };

  const avgRating = stores.length > 0
    ? (stores.reduce((sum, s) => sum + Number(s.rating || 0), 0) / stores.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Total Stores', value: stores.length, color: '#3f51b5' },
    { label: 'Avg Rating', value: avgRating, color: '#ff9800' },
    { label: 'Total Revenue', value: '₹' + (stores.reduce((sum, s) => sum + s.total_revenue, 0) / 100000).toFixed(1) + 'L', color: '#4caf50' },
    { label: 'Total Orders', value: stores.reduce((sum, s) => sum + s.total_orders, 0), color: '#2196f3' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Store Performance Analytics</Typography>
      </Box>

      {loading && <Typography sx={{ mb: 2 }}>Loading performance data...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" sx={{ color: stat.color, mt: 1 }}>{typeof stat.value === 'string' ? stat.value : stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by store name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Reviews</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Orders</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>On-Time Delivery</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Return Rate</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '100px', textAlign: 'center' }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{store.store_name}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Rating value={store.rating} readOnly precision={0.1} size="small" />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: getRatingColor(store.rating) }}>
                          {store.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip label={store.total_reviews} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {store.total_orders}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip label={store.on_time_delivery} size="small" color={getPerformanceColor(store.on_time_delivery) === '#4caf50' ? 'success' : 'warning'} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', color: store.return_rate === '1.8%' ? '#4caf50' : '#ff9800' }}>
                      {store.return_rate}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton size="small" color="primary" onClick={() => setDetailsDialog({ open: true, data: store })} title="View Details">
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No performance data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Store Performance Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Store Name</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.store_name}</Typography>
              </Box>
              
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Rating & Reviews</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Rating value={detailsDialog.data.rating} readOnly precision={0.1} />
                  <Typography sx={{ fontWeight: 'bold', color: getRatingColor(detailsDialog.data.rating) }}>
                    {detailsDialog.data.rating} / 5.0
                  </Typography>
                </Box>
                <Typography variant="body2">Total Reviews: {detailsDialog.data.total_reviews}</Typography>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Sales Metrics</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Total Orders</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.total_orders}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Total Revenue</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#4caf50' }}>₹{detailsDialog.data.total_revenue}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Delivery Performance</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Avg Delivery Time</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.avg_delivery_time}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>On-Time Rate</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#4caf50' }}>{detailsDialog.data.on_time_delivery}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Quality Metrics</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Satisfaction</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#4caf50' }}>{detailsDialog.data.customer_satisfaction}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Return Rate</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#ff9800' }}>{detailsDialog.data.return_rate}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Period</Typography>
                <Typography>{detailsDialog.data.month}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StorePerformance;
