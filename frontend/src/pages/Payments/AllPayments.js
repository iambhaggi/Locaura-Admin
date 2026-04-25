import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { paymentsAPI } from '../../services/apiService';

const AllPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedPayment, setDeletedPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await paymentsAPI.getAll({ limit: 1000 });
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
        payment.gateway_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order_id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  const displayedPayments = filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAddPayment = () => {
    setAddDialog({ 
      open: true, 
      data: { 
        order_id: '', 
        consumer_id: '', 
        retailer_id: '', 
        amount: 0, 
        currency: 'INR',
        method: 'UPI', 
        gateway: 'manual', 
        gateway_order_id: '',
        gateway_payment_id: '',
        gateway_signature: '',
        status: 'pending', 
        failure_reason: '',
        refund_id: '',
        refunded_at: '',
        refund_amount: '',
        metadata_json: '',
      }
    });
  };

  const handleEditPayment = (payment) => {
    setEditDialog({ open: true, data: { ...payment } });
  };

  const handleViewDetails = (payment) => {
    setDetailsDialog({ open: true, data: payment });
  };

  const handleSaveNew = async () => {
    if (!addDialog.data?.order_id || !addDialog.data?.consumer_id || !addDialog.data?.retailer_id) {
      alert('Please provide order_id, consumer_id and retailer_id');
      return;
    }

    let metadata = {};
    try {
      if (addDialog.data.metadata_json) {
        metadata = JSON.parse(addDialog.data.metadata_json);
      }
    } catch (e) {
      alert('Invalid JSON for metadata');
      return;
    }

    try {
      setLoading(true);
      await paymentsAPI.create({
        order_id: addDialog.data.order_id,
        consumer_id: addDialog.data.consumer_id,
        retailer_id: addDialog.data.retailer_id,
        amount: Number(addDialog.data.amount || 0),
        currency: addDialog.data.currency || 'INR',
        method: addDialog.data.method,
        gateway: addDialog.data.gateway,
        gateway_order_id: addDialog.data.gateway_order_id,
        gateway_payment_id: addDialog.data.gateway_payment_id,
        gateway_signature: addDialog.data.gateway_signature,
        status: addDialog.data.status,
        failure_reason: addDialog.data.failure_reason,
        refund_id: addDialog.data.refund_id,
        refunded_at: addDialog.data.refunded_at ? new Date(addDialog.data.refunded_at) : null,
        refund_amount: addDialog.data.refund_amount ? Number(addDialog.data.refund_amount) : null,
        metadata,
      });
      await fetchPayments();
      setAddDialog({ open: false, data: null });
      alert('Payment added successfully');
    } catch (saveError) {
      alert(saveError.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setPayments(payments.map(p => p._id === editDialog.data._id ? editDialog.data : p));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeletePayment = (payment) => {
    setPaymentToDelete(payment);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (paymentToDelete) {
      setDeletedPayment(paymentToDelete);
      setIsDeleted(true);
      setPayments(payments.filter(p => p._id !== paymentToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedPayment) {
      setPayments([...payments, deletedPayment]);
      setDeleteDialog(false);
      setDeletedPayment(null);
      setPaymentToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setPaymentToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Payments', value: payments.length, color: '#3f51b5' },
    { label: 'Completed', value: payments.filter(p => p.status === 'completed').length, color: '#4caf50' },
    { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: '#ff9800' },
    { label: 'Total Amount', value: `₹${payments.reduce((sum, p) => sum + (p.amount || 0), 0)}`, color: '#388e3c' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payments Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPayment}>Add Payment</Button>
      </Box>

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
                  <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumer ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gateway</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedPayments.map((payment) => (
                  <TableRow key={payment._id} hover>
                    <TableCell>{payment.order_id}</TableCell>
                    <TableCell>{payment.consumer_id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2196f3' }}>₹{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.gateway}</TableCell>
                    <TableCell>
                      <Chip label={payment.status} size="small" color={getStatusColor(payment.status)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(payment)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditPayment(payment)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePayment(payment)} title="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Payment Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Order ID</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.order_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Consumer ID</Typography>
                <Typography>{detailsDialog.data.consumer_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Amount</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#2196f3' }}>₹{detailsDialog.data.amount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Payment Method</Typography>
                <Chip label={detailsDialog.data.method} color="primary" variant="outlined" size="small" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Payment Gateway</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.gateway || detailsDialog.data.gateway_payment_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Gateway Transaction ID</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{detailsDialog.data.gateway_payment_id || detailsDialog.data.gateway_tx_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Reference</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{detailsDialog.data.reference}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                <Typography sx={{ fontWeight: 'bold', color: getStatusColor(detailsDialog.data.status) }}>{detailsDialog.data.status.toUpperCase()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Date</Typography>
                <Typography>{detailsDialog.data.created_at}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add New Payment Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>Add New Payment - All Fields</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '70vh', overflow: 'auto' }}>
          {addDialog.data && (
            <>
              <TextField label="Order ID" value={addDialog.data.order_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, order_id: e.target.value } })} fullWidth required />
              <TextField label="Consumer ID" value={addDialog.data.consumer_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, consumer_id: e.target.value } })} fullWidth required />
              <TextField label="Retailer ID" value={addDialog.data.retailer_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, retailer_id: e.target.value } })} fullWidth required />
              <TextField label="Amount (₹)" type="number" value={addDialog.data.amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, amount: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Currency" value={addDialog.data.currency} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, currency: e.target.value } })} fullWidth />

              <TextField select label="Payment Method" value={addDialog.data.method} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, method: e.target.value } })} fullWidth>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="WALLET">Wallet</option>
                <option value="NETBANKING">Net Banking</option>
                <option value="COD">Cash on Delivery</option>
              </TextField>

              <TextField select label="Payment Gateway" value={addDialog.data.gateway} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, gateway: e.target.value } })} fullWidth>
                <option value="manual">Manual</option>
                <option value="razorpay">Razorpay</option>
                <option value="cod">COD</option>
              </TextField>

              <TextField label="Gateway Order ID" value={addDialog.data.gateway_order_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, gateway_order_id: e.target.value } })} fullWidth />
              <TextField label="Gateway Payment ID" value={addDialog.data.gateway_payment_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, gateway_payment_id: e.target.value } })} fullWidth />
              <TextField label="Gateway Signature" value={addDialog.data.gateway_signature} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, gateway_signature: e.target.value } })} fullWidth />

              <TextField select label="Status" value={addDialog.data.status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </TextField>

              <TextField label="Failure Reason" value={addDialog.data.failure_reason} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, failure_reason: e.target.value } })} fullWidth multiline rows={2} />

              <TextField label="Refund ID" value={addDialog.data.refund_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_id: e.target.value } })} fullWidth />
              <TextField label="Refund Amount" type="number" value={addDialog.data.refund_amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_amount: parseFloat(e.target.value) } })} fullWidth />

              <TextField
                label="Refunded At"
                type="datetime-local"
                value={addDialog.data.refunded_at}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refunded_at: e.target.value } })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Metadata (JSON Object)"
                value={addDialog.data.metadata_json}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, metadata_json: e.target.value } })}
                fullWidth
                multiline
                rows={3}
                helperText='Example: {"key": "value"}'
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Order ID" value={editDialog.data.order_id} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, order_id: e.target.value } })} fullWidth />
              <TextField label="Consumer ID" value={editDialog.data.consumer_id} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, consumer_id: e.target.value } })} fullWidth />
              <TextField label="Amount (₹)" type="number" value={editDialog.data.amount} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, amount: parseFloat(e.target.value) } })} fullWidth />
              <TextField select label="Payment Method" value={editDialog.data.method} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, method: e.target.value } })} fullWidth>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="Wallet">Wallet</option>
                <option value="NetBanking">Net Banking</option>
              </TextField>
              <TextField select label="Payment Gateway" value={editDialog.data.gateway} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, gateway: e.target.value } })} fullWidth>
                <option value="Google Pay">Google Pay</option>
                <option value="Razorpay">Razorpay</option>
                <option value="Paytm">Paytm</option>
                <option value="PhonePe">PhonePe</option>
              </TextField>
              <TextField label="Gateway Transaction ID" value={editDialog.data.gateway_payment_id} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, gateway_payment_id: e.target.value } })} fullWidth />
              <TextField select label="Status" value={editDialog.data.status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Payment"
        description="This payment will be deleted. You have 10 seconds to undo this action."
        itemName={paymentToDelete?.transaction_id || 'Payment'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default AllPayments;
