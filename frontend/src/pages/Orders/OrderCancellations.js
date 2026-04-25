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
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { ordersAPI } from '../../services/apiService';

const OrderCancellations = () => {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [cancellationToDelete, setCancellationToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedCancellation, setDeletedCancellation] = useState(null);

  useEffect(() => {
    const fetchCancellations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ status: 'cancelled', limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((order) => ({
          ...order,
          _id: order._id,
          order_id: order.order_number || order._id,
          consumer_name: order.consumer_name || 'Unknown',
          consumer_email: order.consumer_email || String(order.consumer_id || '-'),
          store_name: order.store_name || String(order.store_id || '-'),
          order_amount: Number(order.pricing?.total || 0),
          cancellation_reason: order.cancellation_reason || 'Not specified',
          cancelled_by: order.cancelled_by || 'System',
          refund_status: order.refund_status || 'pending',
          refund_amount: Number(order.refund_amount || order.pricing?.total || 0),
          cancellation_date: order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : (order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : '-'),
          refund_date: order.refund_date ? new Date(order.refund_date).toLocaleDateString() : null,
        }));
        setCancellations(mapped);
      } catch (err) {
        setError('Failed to fetch cancelled orders');
      } finally {
        setLoading(false);
      }
    };

    fetchCancellations();
  }, []);

  const handleAddCancellation = () => {
    setAddDialog({
      open: true,
      data: {
        order_id: '',
        consumer_name: '',
        store_name: '',
        order_amount: '',
        cancellation_reason: 'Customer requested',
        cancelled_by: 'Customer',
        refund_status: 'pending',
        refund_amount: '',
      }
    });
  };

  const handleEditCancellation = (cancellation) => {
    setEditDialog({ open: true, data: { ...cancellation } });
  };

  const handleViewDetails = (cancellation) => {
    setDetailsDialog({ open: true, data: cancellation });
  };

  const handleSaveNew = () => {
    if (addDialog.data && addDialog.data.order_id) {
      setCancellations([...cancellations, {
        ...addDialog.data,
        _id: 'canc_' + Math.random().toString(36).substr(2, 9),
        cancellation_date: new Date().toISOString().split('T')[0]
      }]);
      setAddDialog({ open: false, data: null });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setCancellations(cancellations.map(c => c._id === editDialog.data._id ? editDialog.data : c));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteOrder = (order) => {
    setCancellationToDelete(order);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (cancellationToDelete) {
      setDeletedCancellation(cancellationToDelete);
      setIsDeleted(true);
      setCancellations(cancellations.filter(c => c._id !== cancellationToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedCancellation) {
      setCancellations([...cancellations, deletedCancellation]);
      setDeleteDialog(false);
      setDeletedCancellation(null);
      setCancellationToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setCancellationToDelete(null);
    }
  };

  const filteredCancellations = cancellations.filter((canc) =>
    canc.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canc.consumer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canc.store_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRefundStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getCancelledByChipColor = (by) => {
    return by === 'Customer' ? 'primary' : 'secondary';
  };

  const stats = [
    { label: 'Total Cancellations', value: cancellations.length, color: '#d32f2f' },
    { label: 'Refunded', value: cancellations.filter(c => c.refund_status === 'completed').length, color: '#388e3c' },
    { label: 'Pending Refunds', value: cancellations.filter(c => c.refund_status === 'pending').length, color: '#f57c00' },
    { label: 'Total Refunded Amount', value: '₹' + cancellations.reduce((sum, c) => sum + (c.refund_status === 'completed' ? c.refund_amount : 0), 0), color: '#1976d2' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Order Cancellations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCancellation}>Record Cancellation</Button>
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
            placeholder="Search by order ID, consumer name, or store..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cancelled By</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Refund Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCancellations.map((canc) => (
                  <TableRow key={canc._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{canc.order_id}</TableCell>
                    <TableCell>{canc.consumer_name}</TableCell>
                    <TableCell>{canc.store_name}</TableCell>
                    <TableCell>₹{canc.order_amount}</TableCell>
                    <TableCell>
                      <Chip label={canc.cancelled_by} size="small" color={getCancelledByChipColor(canc.cancelled_by)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={canc.refund_status} size="small" color={getRefundStatusColor(canc.refund_status)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(canc)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditCancellation(canc)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteOrder(canc)} title="Delete">
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Cancellation Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Order ID</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.order_id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Consumer</Typography>
                <Typography>{detailsDialog.data.consumer_name}</Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>{detailsDialog.data.consumer_email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Store</Typography>
                <Typography>{detailsDialog.data.store_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Order Amount</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>₹{detailsDialog.data.order_amount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Cancellation Reason</Typography>
                <Typography>{detailsDialog.data.cancellation_reason}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Cancelled By</Typography>
                <Chip label={detailsDialog.data.cancelled_by} size="small" color={getCancelledByChipColor(detailsDialog.data.cancelled_by)} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Cancellation Date</Typography>
                <Typography>{detailsDialog.data.cancellation_date}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Refund Status</Typography>
                <Chip label={detailsDialog.data.refund_status} size="small" color={getRefundStatusColor(detailsDialog.data.refund_status)} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Refund Amount</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>₹{detailsDialog.data.refund_amount}</Typography>
              </Box>
              {detailsDialog.data.refund_date && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Refund Date</Typography>
                  <Typography>{detailsDialog.data.refund_date}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Cancellation Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Record Order Cancellation</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Order ID" value={addDialog.data.order_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, order_id: e.target.value } })} fullWidth />
              <TextField label="Consumer Name" value={addDialog.data.consumer_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, consumer_name: e.target.value } })} fullWidth />
              <TextField label="Store Name" value={addDialog.data.store_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, store_name: e.target.value } })} fullWidth />
              <TextField label="Order Amount" type="number" value={addDialog.data.order_amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, order_amount: parseInt(e.target.value) } })} fullWidth />
              <TextField select label="Cancellation Reason" value={addDialog.data.cancellation_reason} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, cancellation_reason: e.target.value } })} fullWidth>
                <option value="Customer requested">Customer Requested</option>
                <option value="Items out of stock">Items Out of Stock</option>
                <option value="Store closed">Store Closed</option>
                <option value="Payment failed">Payment Failed</option>
                <option value="Delivery issue">Delivery Issue</option>
              </TextField>
              <TextField select label="Cancelled By" value={addDialog.data.cancelled_by} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, cancelled_by: e.target.value } })} fullWidth>
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
                <option value="System">System</option>
              </TextField>
              <TextField label="Refund Amount" type="number" value={addDialog.data.refund_amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_amount: parseInt(e.target.value) } })} fullWidth />
              <TextField select label="Refund Status" value={addDialog.data.refund_status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, refund_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Record Cancellation</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Cancellation Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Cancellation</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Order ID" value={editDialog.data.order_id} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, order_id: e.target.value } })} fullWidth />
              <TextField label="Consumer Name" value={editDialog.data.consumer_name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, consumer_name: e.target.value } })} fullWidth />
              <TextField label="Store Name" value={editDialog.data.store_name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, store_name: e.target.value } })} fullWidth />
              <TextField select label="Refund Status" value={editDialog.data.refund_status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, refund_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
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
        title="Delete Cancellation"
        description="This cancellation record will be deleted. You have 10 seconds to undo this action."
        itemName={cancellationToDelete?.order_id || 'Cancellation'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default OrderCancellations;
