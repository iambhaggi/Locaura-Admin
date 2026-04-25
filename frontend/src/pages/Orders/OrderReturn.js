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

const OrderReturn = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [returnToDelete, setReturnToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedReturn, setDeletedReturn] = useState(null);

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ limit: 1000 });
        // For now, show delivered orders as potential returns (delivered within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const returnOrders = (response?.data?.data || response?.data || []).filter(order =>
          ['delivered', 'completed'].includes((order.status || '').toLowerCase()) &&
          order.updatedAt && new Date(order.updatedAt) >= sevenDaysAgo
        );

        const mapped = returnOrders.map((order) => ({
          ...order,
          _id: order._id,
          order_id: order.order_number || order._id,
          consumer_name: order.consumer_name || 'Unknown',
          consumer_email: order.consumer_email || String(order.consumer_id || '-'),
          items: Array.isArray(order.items) ? order.items.map(item => ({
            name: item.name || item.product_name || 'Unknown Item',
            quantity: item.quantity || 1,
            refund: item.price || 0
          })) : [{ name: 'Order Items', quantity: 1, refund: 0 }],
          total_refund: Number(order.pricing?.total || 0),
          return_reason: order.return_reason || null,
          return_status: order.return_status || null,
          return_date: order.return_date ? new Date(order.return_date).toLocaleDateString() : null,
          refund_date: order.refund_date ? new Date(order.refund_date).toLocaleDateString() : null,
        }));
        setReturns(mapped);
      } catch (err) {
        setError('Failed to fetch return orders');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const handleAddReturn = () => {
    setAddDialog({
      open: true,
      data: {
        order_id: '',
        consumer_name: '',
        items: '',
        total_refund: '',
        return_reason: 'Damaged items',
        return_status: 'pending',
      }
    });
  };

  const handleEditReturn = (ret) => {
    setEditDialog({ open: true, data: { ...ret } });
  };

  const handleViewDetails = (ret) => {
    setDetailsDialog({ open: true, data: ret });
  };

  const handleSaveNew = () => {
    if (addDialog.data && addDialog.data.order_id) {
      setReturns([...returns, {
        ...addDialog.data,
        _id: 'ret_' + Math.random().toString(36).substr(2, 9),
        items: typeof addDialog.data.items === 'string' ? [{ name: addDialog.data.items, quantity: 1, refund: addDialog.data.total_refund }] : addDialog.data.items,
        return_date: new Date().toISOString().split('T')[0]
      }]);
      setAddDialog({ open: false, data: null });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setReturns(returns.map(r => r._id === editDialog.data._id ? editDialog.data : r));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteReturn = (order) => {
    setReturnToDelete(order);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (returnToDelete) {
      setDeletedReturn(returnToDelete);
      setIsDeleted(true);
      setReturns(returns.filter(r => r._id !== returnToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedReturn) {
      setReturns([...returns, deletedReturn]);
      setDeleteDialog(false);
      setDeletedReturn(null);
      setReturnToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setReturnToDelete(null);
    }
  };

  const filteredReturns = returns.filter((ret) =>
    ret.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.consumer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReturnStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'approved': return 'info';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Returns', value: returns.length, color: '#f57c00' },
    { label: 'Completed', value: returns.filter(r => r.return_status === 'completed').length, color: '#388e3c' },
    { label: 'Pending', value: returns.filter(r => r.return_status === 'pending').length, color: '#fbc02d' },
    { label: 'Total Refunded', value: '₹' + returns.reduce((sum, r) => sum + (r.return_status === 'completed' ? r.total_refund : 0), 0), color: '#1976d2' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Product Returns & Refunds</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddReturn}>Record Return</Button>
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
            placeholder="Search by order ID or consumer name..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Refund Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReturns.map((ret) => (
                  <TableRow key={ret._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{ret.order_id}</TableCell>
                    <TableCell>{ret.consumer_name}</TableCell>
                    <TableCell>
                      <Chip label={Array.isArray(ret.items) ? ret.items.length + ' items' : '1 item'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>₹{ret.total_refund}</TableCell>
                    <TableCell>
                      <Chip label={ret.return_status} size="small" color={getReturnStatusColor(ret.return_status)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(ret)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditReturn(ret)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteReturn(ret)} title="Delete">
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Return Details</DialogTitle>
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
                <Typography variant="caption" sx={{ color: '#666' }}>Returned Items</Typography>
                {Array.isArray(detailsDialog.data.items) && detailsDialog.data.items.map((item, idx) => (
                  <Box key={idx} sx={{ fontSize: '0.9rem', ml: 1 }}>
                    • {item.name} (Qty: {item.quantity}, Refund: ₹{item.refund})
                  </Box>
                ))}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Return Reason</Typography>
                <Typography>{detailsDialog.data.return_reason}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Return Date</Typography>
                <Typography>{detailsDialog.data.return_date}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Return Status</Typography>
                <Chip label={detailsDialog.data.return_status} size="small" color={getReturnStatusColor(detailsDialog.data.return_status)} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Refund Amount</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#388e3c' }}>₹{detailsDialog.data.total_refund}</Typography>
              </Box>
              {detailsDialog.data.refund_date && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Refund Completed Date</Typography>
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

      {/* Add Return Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Record Product Return</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Order ID" value={addDialog.data.order_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, order_id: e.target.value } })} fullWidth />
              <TextField label="Consumer Name" value={addDialog.data.consumer_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, consumer_name: e.target.value } })} fullWidth />
              <TextField label="Items (comma separated)" value={addDialog.data.items} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, items: e.target.value } })} fullWidth />
              <TextField label="Total Refund Amount" type="number" value={addDialog.data.total_refund} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, total_refund: parseInt(e.target.value) } })} fullWidth />
              <TextField select label="Return Reason" value={addDialog.data.return_reason} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, return_reason: e.target.value } })} fullWidth>
                <option value="Damaged items">Damaged Items</option>
                <option value="Defective product">Defective Product</option>
                <option value="Wrong item sent">Wrong Item Sent</option>
                <option value="Quality issue">Quality Issue</option>
                <option value="Customer not satisfied">Customer Not Satisfied</option>
              </TextField>
              <TextField select label="Return Status" value={addDialog.data.return_status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, return_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Record Return</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Return Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Return</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Order ID" value={editDialog.data.order_id} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, order_id: e.target.value } })} fullWidth disabled />
              <TextField select label="Return Status" value={editDialog.data.return_status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, return_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </TextField>
              <TextField label="Total Refund" type="number" value={editDialog.data.total_refund} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, total_refund: parseInt(e.target.value) } })} fullWidth />
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
        title="Delete Return"
        description="This return request will be deleted. You have 10 seconds to undo this action."
        itemName={returnToDelete?.order_id || 'Return'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default OrderReturn;
