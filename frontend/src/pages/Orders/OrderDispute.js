import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress } from '@mui/material';
import { ordersAPI } from '../../services/apiService';

const OrderDispute = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ limit: 1000 });
        // Show orders that might have disputes: cancelled, failed, or with dispute flags
        const disputeOrders = (response?.data?.data || response?.data || []).filter(order =>
          ['cancelled', 'failed'].includes((order.status || '').toLowerCase()) ||
          order.dispute_status ||
          order.complaint
        );

        const mapped = disputeOrders.map((order) => ({
          ...order,
          total_price: Number(order.pricing?.total || 0),
          consumer_email: order.consumer_email || String(order.consumer_id || '-'),
          store_name: order.store_name || String(order.store_id || '-'),
          created_at: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
          dispute_reason: order.dispute_reason || order.cancellation_reason || 'Order Issue',
          dispute_status: order.dispute_status || (order.status === 'cancelled' ? 'resolved' : 'active'),
          resolution_date: order.resolution_date ? new Date(order.resolution_date).toLocaleDateString() : null,
        }));
        setDisputes(mapped);
      } catch (err) {
        setError('Failed to fetch dispute orders');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const getDisputeStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'resolved': return 'success';
      case 'active': return 'warning';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Active Disputes', value: disputes.filter(d => (d.dispute_status || '').toLowerCase() === 'active').length, color: '#d32f2f' },
    { label: 'Resolved', value: disputes.filter(d => (d.dispute_status || '').toLowerCase() === 'resolved').length, color: '#388e3c' },
    { label: 'Escalated', value: disputes.filter(d => (d.dispute_status || '').toLowerCase() === 'escalated').length, color: '#f57c00' },
    { label: 'Total Amount Involved', value: '₹' + disputes.reduce((sum, d) => sum + d.total_price, 0), color: '#1976d2' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Order Disputes</Typography>

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
                  <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Dispute Reason</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute._id} hover>
                    <TableCell>{dispute.order_number}</TableCell>
                    <TableCell>{dispute.consumer_email}</TableCell>
                    <TableCell>{dispute.store_name}</TableCell>
                    <TableCell>₹{dispute.total_price}</TableCell>
                    <TableCell sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dispute.dispute_reason}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dispute.dispute_status}
                        size="small"
                        color={getDisputeStatusColor(dispute.dispute_status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{dispute.created_at}</TableCell>
                  </TableRow>
                ))}
                {!loading && disputes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No disputes found</TableCell>
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

export default OrderDispute;
