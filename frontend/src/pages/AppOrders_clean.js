import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { ordersAPI } from '../services/apiService';

function AppOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'info',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'error',
    };
    return colorMap[status] || 'default';
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>📦 Orders Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by order ID"
            variant="outlined"
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" size="small" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchOrders}>Refresh</Button>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedOrders.map((order) => (
                <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{order.order_id}</Typography></TableCell>
                  <TableCell>{order.consumer_name || 'N/A'}</TableCell>
                  <TableCell>₹{order.total_amount}</TableCell>
                  <TableCell><Chip label={order.status} color={getStatusColor(order.status)} size="small" /></TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredOrders.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>
    </Box>
  );
};

export default AppOrders;