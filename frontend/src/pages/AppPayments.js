import React, { useState, useEffect, useCallback } from 'react';
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
import { paymentsAPI } from '../services/apiService';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

function AppPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await paymentsAPI.getAll();
      setPayments(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = useCallback(() => {
    let filtered = payments;
    if (searchTerm) {
      filtered = filtered.filter((payment) =>
        payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }
    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedPayments = filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    const colorMap = { success: 'success', pending: 'warning', failed: 'error', refunded: 'info' };
    return colorMap[status] || 'default';
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      await paymentsAPI.delete(paymentToDelete._id);
      setPayments(payments.filter(payment => payment._id !== paymentToDelete._id));
      setFilteredPayments(filteredPayments.filter(payment => payment._id !== paymentToDelete._id));
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment');
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>💳 Payments Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by payment ID"
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
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchPayments}>Refresh</Button>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedPayments.map((payment) => (
                <TableRow key={payment._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{payment.payment_id}</Typography></TableCell>
                  <TableCell>{payment.order_id}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell><Chip label={payment.status} color={getStatusColor(payment.status)} size="small" /></TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#f44336' }} onClick={() => handleDeleteClick(payment)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredPayments.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Payment"
        itemName={`Payment - ${paymentToDelete?.payment_id || 'Payment'}`}
        timeout={10}
      />
    </Box>
  );
};

export default AppPayments;