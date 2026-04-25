import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { paymentsAPI } from '../../services/apiService';

const PaymentRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [refundToDelete, setRefundToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedRefund, setDeletedRefund] = useState(null);

  useEffect(() => {
    const fetchRefunds = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await paymentsAPI.getAll({ limit: 1000 });
        const loadedRefunds = (response.data?.data || response.data || []).filter((payment) =>
          payment.refund_amount > 0 || payment.refund_id || payment.refunded_at
        ).map((payment) => ({
          ...payment,
          refund_amount: payment.refund_amount || 0,
          refund_id: payment.refund_id || payment.gateway_payment_id || payment._id,
          refund_status: payment.refund_amount > 0 || payment.refunded_at ? 'refunded' : 'pending',
          refunded_at: payment.refunded_at ? new Date(payment.refunded_at).toLocaleDateString() : '-',
        }));
        setRefunds(loadedRefunds);
      } catch (err) {
        console.error('Error fetching refunds:', err);
        setError(err.message || 'Failed to load refunds');
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, []);

  useEffect(() => {
    setFilteredRefunds(refunds.filter((refund) => {
      const query = searchTerm.toLowerCase();
      return (
        (refund.refund_id?.toString().toLowerCase().includes(query) || '') ||
        (refund.order_id?.toString().toLowerCase().includes(query) || '') ||
        (refund.consumer_id?.toString().toLowerCase().includes(query) || '')
      );
    }));
  }, [refunds, searchTerm]);

  const handleAddRefund = () => {
    setAddDialog({
      open: true,
      data: {
        original_payment_id: '',
        order_id: '',
        consumer_name: '',
        original_amount: '',
        refund_amount: '',
        refund_reason: 'Product damaged',
        refund_method: 'Original Payment Method',
        refund_status: 'pending',
        payment_method: 'UPI',
      }
    });
  };

  const handleEditRefund = (refund) => {
    setEditDialog({ open: true, data: { ...refund } });
  };

  const handleViewDetails = (refund) => {
    setDetailsDialog({ open: true, data: refund });
  };

  const handleSaveNew = () => {
    if (addDialog.data && addDialog.data.original_payment_id) {
      setRefunds([...refunds, {
        ...addDialog.data,
        _id: 'refund_' + Math.random().toString(36).substr(2, 9),
        initiated_date: new Date().toISOString().split('T')[0]
      }]);
      setAddDialog({ open: false, data: null });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setRefunds(refunds.map(r => r._id === editDialog.data._id ? editDialog.data : r));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteRefund = (refund) => {
    setRefundToDelete(refund);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (refundToDelete) {
      setDeletedRefund(refundToDelete);
      setIsDeleted(true);
      setRefunds(refunds.filter(r => r._id !== refundToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedRefund) {
      setRefunds([...refunds, deletedRefund]);
      setDeleteDialog(false);
      setDeletedRefund(null);
      setRefundToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setRefundToDelete(null);
    }
  };

  const searchableRefunds = filteredRefunds;

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Refunds', value: refunds.length, color: '#d32f2f' },
    { label: 'Refunded', value: refunds.filter(r => r.refund_status === 'refunded').length, color: '#388e3c' },
    { label: 'Pending', value: refunds.filter(r => r.refund_status === 'pending').length, color: '#f57c00' },
    { label: 'Total Refunded', value: '₹' + refunds.reduce((sum, r) => sum + (r.refund_amount || 0), 0), color: '#1976d2' },
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
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payment Refunds</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRefund}>Process Refund</Button>
      </Box>

      <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ color: '#1565c0' }}>
          ℹ️ <strong>Refunds:</strong> Money we refund back to consumers (e.g., due to damaged products, cancellations, or disputes)
        </Typography>
        <Typography variant="body2" sx={{ color: '#1565c0', mt: 1 }}>
          This is different from <strong>Payments</strong> which shows money consumers pay us for orders.
        </Typography>
      </Box>

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
            placeholder="Search by payment ID, order ID, or consumer name..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Refund Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchableRefunds.map((refund) => (
                  <TableRow key={refund._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{refund.refund_id}</TableCell>
                    <TableCell>{refund.order_id}</TableCell>
                    <TableCell>{refund.consumer_id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#d32f2f' }}>₹{refund.refund_amount}</TableCell>
                    <TableCell>
                      <Chip label={refund.method || refund.refund_method} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={refund.refund_status} size="small" color={getRefundStatusColor(refund.refund_status)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(refund)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditRefund(refund)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteRefund(refund)} title="Delete">
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Refund Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Payment ID</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.refund_id || detailsDialog.data.gateway_payment_id || detailsDialog.data._id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Order ID</Typography>
                <Typography>{detailsDialog.data.order_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Consumer</Typography>
                <Typography>{detailsDialog.data.consumer_id || detailsDialog.data.consumer_name || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Refund Amount (Money Going Back)</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#d32f2f' }}>₹{detailsDialog.data.refund_amount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Refund Reason</Typography>
                <Typography>{detailsDialog.data.refund_reason || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Refund Method</Typography>
                <Chip label={detailsDialog.data.method || detailsDialog.data.refund_method || 'Original Payment Method'} size="small" color="primary" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                <Chip label={detailsDialog.data.refund_status} size="small" color={getRefundStatusColor(detailsDialog.data.refund_status)} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Initiated Date</Typography>
                <Typography>{detailsDialog.data.initiated_date}</Typography>
              </Box>
              {detailsDialog.data.completed_date && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Completed Date</Typography>
                  <Typography>{detailsDialog.data.completed_date}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Refund Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Original Payment ID" value={addDialog.data.original_payment_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, original_payment_id: e.target.value } })} fullWidth />
              <TextField label="Order ID" value={addDialog.data.order_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, order_id: e.target.value } })} fullWidth />
              <TextField label="Consumer Name" value={addDialog.data.consumer_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, consumer_name: e.target.value } })} fullWidth />
              <TextField label="Original Amount" type="number" value={addDialog.data.original_amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, original_amount: parseInt(e.target.value) } })} fullWidth />
              <TextField label="Refund Amount" type="number" value={addDialog.data.refund_amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_amount: parseInt(e.target.value) } })} fullWidth />
              <TextField select label="Refund Reason" value={addDialog.data.refund_reason} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_reason: e.target.value } })} fullWidth>
                <option value="Product damaged">Product Damaged</option>
                <option value="Order cancelled">Order Cancelled</option>
                <option value="Wrong item sent">Wrong Item Sent</option>
                <option value="Customer dispute">Customer Dispute</option>
                <option value="Payment error">Payment Error</option>
              </TextField>
              <TextField select label="Refund Method" value={addDialog.data.refund_method} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_method: e.target.value } })} fullWidth>
                <option value="Original Payment Method">Original Payment Method</option>
                <option value="Wallet Credit">Wallet Credit</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </TextField>
              <TextField select label="Status" value={addDialog.data.refund_status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Process Refund</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Refund Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Update Refund</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Original Payment ID" value={editDialog.data.original_payment_id} disabled fullWidth />
              <TextField select label="Status" value={editDialog.data.refund_status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, refund_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </TextField>
              <TextField label="Refund Amount" type="number" value={editDialog.data.refund_amount} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, refund_amount: parseInt(e.target.value) } })} fullWidth />
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
        title="Delete Refund"
        description="This refund will be deleted. You have 10 seconds to undo this action."
        itemName={refundToDelete?.refund_id || 'Refund'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default PaymentRefunds;
