import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress } from '@mui/material';
import { ordersAPI } from '../../services/apiService';

const OrderDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ limit: 1000 });
        const deliveryOrders = (response?.data?.data || response?.data || []).filter(order =>
          ['out_for_delivery', 'in_transit', 'delivered', 'completed'].includes((order.status || '').toLowerCase())
        );
        const mapped = deliveryOrders.map((order) => ({
          ...order,
          total_price: Number(order.pricing?.total || 0),
          consumer_email: order.consumer_email || String(order.consumer_id || '-'),
          store_name: order.store_name || String(order.store_id || '-'),
          rider_name: order.rider_name || String(order.rider_id || '-'),
          created_at: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
          delivery_address: [
            order.delivery_address?.line1,
            order.delivery_address?.line2,
            order.delivery_address?.city,
            order.delivery_address?.state,
            order.delivery_address?.pincode,
          ].filter(Boolean).join(', '),
          items_count: Array.isArray(order.items) ? order.items.length : 0,
        }));
        setOrders(mapped);
      } catch (err) {
        setError('Failed to fetch delivery orders');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryOrders();
  }, []);

  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'out_for_delivery': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Delivery Orders', value: orders.length, color: '#3f51b5' },
    { label: 'Delivered', value: orders.filter((o) => ['delivered', 'completed'].includes((o.status || '').toLowerCase())).length, color: '#4caf50' },
    { label: 'In Transit', value: orders.filter((o) => ['in_transit', 'out_for_delivery'].includes((o.status || '').toLowerCase())).length, color: '#2196f3' },
    { label: 'Avg Delivery Time', value: '45 min', color: '#ff9800' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Order Delivery</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" sx={{ color: stat.color, mt: 1 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Delivery Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.consumer_email}</TableCell>
                    <TableCell>{order.rider_name}</TableCell>
                    <TableCell>₹{order.total_price}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" color={getStatusColor(order.status)} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.delivery_address}
                    </TableCell>
                    <TableCell>{order.created_at}</TableCell>
                  </TableRow>
                ))}
                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No delivery orders found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

const OrderCancellations = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Cancelled Orders</Typography><Grid container spacing={2}><Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Total Cancelled</Typography><Typography variant="h4" sx={{ color: '#d32f2f' }}>12</Typography></CardContent></Card></Grid></Grid></Container>
);

const OrderReturn = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Order Returns</Typography><Grid container spacing={2}><Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Total Returns</Typography><Typography variant="h4" sx={{ color: '#f57c00' }}>8</Typography></CardContent></Card></Grid></Grid></Container>
);

const OrderDispute = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Order Disputes</Typography><Grid container spacing={2}><Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Active Disputes</Typography><Typography variant="h4" sx={{ color: '#d32f2f' }}>3</Typography></CardContent></Card></Grid></Grid></Container>
);

export { OrderDelivery, OrderCancellations, OrderReturn, OrderDispute };
