import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Chip, LinearProgress } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { ordersAPI } from '../../services/apiService';

const OrderTimeline = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ limit: 100 });
        const mapped = (response?.data?.data || response?.data || []).map((order) => ({
          ...order,
          total_price: Number(order.pricing?.total || 0),
          consumer_email: order.consumer_email || String(order.consumer_id || '-'),
          store_name: order.store_name || String(order.store_id || '-'),
          created_at: order.createdAt ? new Date(order.createdAt).toLocaleString() : '-',
          delivery_address: [
            order.delivery_address?.line1,
            order.delivery_address?.line2,
            order.delivery_address?.city,
            order.delivery_address?.state,
            order.delivery_address?.pincode,
          ].filter(Boolean).join(', '),
          payment_method: order.payment?.method || '-',
          items_count: Array.isArray(order.items) ? order.items.length : 0,
          status_history: order.status_history || [],
        }));
        setOrders(mapped);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'out_for_delivery': return 'info';
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'placed': return 'warning';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTimelineSteps = (order) => {
    const steps = [
      { step: 'Order Placed', time: order.created_at, status: 'completed' },
      { step: 'Payment Confirmed', time: order.created_at, status: order.payment?.status === 'paid' ? 'completed' : 'pending' },
      { step: 'Store Confirmed', time: order.created_at, status: ['confirmed', 'preparing', 'ready', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : 'pending' },
      { step: 'Out for Delivery', time: order.created_at, status: ['out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : 'pending' },
      { step: 'Delivered', time: order.created_at, status: order.status === 'delivered' ? 'completed' : 'pending' },
    ];
    return steps;
  };

  return (
    <Container sx={{ py: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Order Timeline</Typography>

      <Grid container spacing={3}>
        {orders.slice(0, 10).map((order) => (
          <Grid item xs={12} md={6} key={order._id}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Order #{order.order_number}
                </Typography>
                <Chip
                  label={order.status}
                  size="small"
                  color={getStatusColor(order.status)}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Consumer: {order.consumer_email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Store: {order.store_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Amount: ₹{order.total_price}
                </Typography>
              </Box>

              <Timeline sx={{ p: 0 }}>
                {getTimelineSteps(order).map((step, index) => (
                  <TimelineItem key={index} sx={{ minHeight: 'auto' }}>
                    <TimelineSeparator>
                      <TimelineDot color={step.status === 'completed' ? 'success' : 'grey'} />
                      {index < getTimelineSteps(order).length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {step.step}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {step.time}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>
          </Grid>
        ))}

        {!loading && orders.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">No orders found</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default OrderTimeline;
