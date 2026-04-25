import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { payoutsAPI } from '../../services/apiService';

const RetailerPayouts = () => {
  const location = useLocation();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [payoutToDelete, setPayoutToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedPayout, setDeletedPayout] = useState(null);

  const statusFilter = location.pathname.endsWith('/pending')
    ? 'pending'
    : location.pathname.endsWith('/completed')
    ? 'completed'
    : undefined;

  const title = location.pathname.endsWith('/pending')
    ? 'Pending Retailer Payouts'
    : location.pathname.endsWith('/completed')
    ? 'Completed Retailer Payouts'
    : location.pathname.endsWith('/history')
    ? 'Retailer Payout History'
    : 'Retailer Payouts';

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 1000 };
        if (statusFilter) params.status = statusFilter;
        const response = await payoutsAPI.getAll(params);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        setPayouts(data.map((payout) => ({
          ...payout,
          retailer_name: payout.retailer_name || String(payout.retailer_id || ''),
          payout_amount: Number(payout.total_revenue || 0),
          commission: Number(payout.platform_fee || 0),
          net_amount: Number(payout.net_payout || 0),
          period: payout.period?.from && payout.period?.to
            ? `${new Date(payout.period.from).toLocaleDateString()} - ${new Date(payout.period.to).toLocaleDateString()}`
            : '-',
        })));
      } catch (err) {
        console.error('Error fetching retailer payouts:', err);
        setError(err.message || 'Failed to load retailer payouts');
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [statusFilter]);

  const handleAddPayout = () => {
    setAddDialog({
      open: true,
      data: {
        retailer_id: '',
        store_id: '',
        period_from: '',
        period_to: '',
        retailer_name: '',
        total_orders: 0,
        payout_amount: 0,
        commission: 0,
        payout_reference: '',
        paid_at: '',
        status: 'pending',
        payout_method: 'Bank Transfer',
      }
    });
  };

  const handleEditPayout = (payout) => {
    setEditDialog({ open: true, data: { ...payout } });
  };

  const handleViewDetails = (payout) => {
    setDetailsDialog({ open: true, data: payout });
  };

  const handleSaveNew = async () => {
    if (!addDialog.data?.retailer_id || !addDialog.data?.store_id || !addDialog.data?.period_from || !addDialog.data?.period_to) {
      alert('Please fill retailer_id, store_id and payout period');
      return;
    }

    try {
      const totalRevenue = Number(addDialog.data.payout_amount || 0);
      const platformFee = Number(addDialog.data.commission || 0);
      const netPayout = totalRevenue - platformFee;

      const response = await payoutsAPI.create({
        retailer_id: addDialog.data.retailer_id,
        store_id: addDialog.data.store_id,
        period_from: addDialog.data.period_from,
        period_to: addDialog.data.period_to,
        total_orders: Number(addDialog.data.total_orders || 0),
        total_revenue: totalRevenue,
        platform_fee: platformFee,
        net_payout: netPayout,
        status: addDialog.data.status,
        payout_reference: addDialog.data.payout_reference,
        paid_at: addDialog.data.paid_at ? new Date(addDialog.data.paid_at) : null,
      });

      const created = response.data?.data || response.data;
      setPayouts([
        {
          ...created,
          retailer_name: addDialog.data.retailer_name || String(created.retailer_id || ''),
          payout_amount: totalRevenue,
          commission: platformFee,
          net_amount: netPayout,
          period: `${new Date(addDialog.data.period_from).toLocaleDateString()} - ${new Date(addDialog.data.period_to).toLocaleDateString()}`,
        },
        ...payouts,
      ]);
      setAddDialog({ open: false, data: null });
      alert('Payout added successfully');
    } catch (saveError) {
      alert(saveError.message || 'Failed to add payout');
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setPayouts(payouts.map(p => p._id === editDialog.data._id ? editDialog.data : p));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeletePayout = (payout) => {
    setPayoutToDelete(payout);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (payoutToDelete) {
      setDeletedPayout(payoutToDelete);
      setIsDeleted(true);
      setPayouts(payouts.filter(p => p._id !== payoutToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedPayout) {
      setPayouts([...payouts, deletedPayout]);
      setDeleteDialog(false);
      setDeletedPayout(null);
      setPayoutToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setPayoutToDelete(null);
    }
  };

  const filteredPayouts = Array.isArray(payouts)
    ? payouts.filter((payout) =>
        String(payout.retailer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Retailer Payouts', value: Array.isArray(payouts) ? payouts.length : 0, color: '#3f51b5' },
    { label: 'Total Revenue', value: '₹' + (Array.isArray(payouts) ? payouts.reduce((sum, p) => sum + (p.total_revenue || 0), 0) : 0), color: '#4caf50' },
    { label: 'Pending Payouts', value: Array.isArray(payouts) ? payouts.filter(p => p.status === 'pending').length : 0, color: '#ff9800' },
    { label: 'Completed Payouts', value: Array.isArray(payouts) ? payouts.filter(p => p.status === 'completed').length : 0, color: '#1976d2' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="320px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>Payout settlements to registered retailers</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPayout}>Add Payout</Button>
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by retailer name..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Retailer Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Gross Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Commission</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Net Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayouts.map((payout) => (
                  <TableRow key={payout._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{payout.retailer_name}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>₹{payout.payout_amount}</TableCell>
                    <TableCell sx={{ textAlign: 'right', color: '#f44336' }}>₹{payout.commission}</TableCell>
                    <TableCell sx={{ textAlign: 'right', color: '#4caf50', fontWeight: 'bold' }}>₹{payout.net_amount}</TableCell>
                    <TableCell>
                      <Chip label={payout.status} size="small" color={getStatusColor(payout.status)} />
                    </TableCell>
                    <TableCell>{payout.period}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(payout)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditPayout(payout)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePayout(payout)} title="Delete">
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Retailer Payout Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Retailer Name</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.retailer_name}</Typography>
              </Box>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Amount Details</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Gross Amount</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>₹{detailsDialog.data.payout_amount}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Commission</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#f44336' }}>₹{detailsDialog.data.commission}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Net Payout Amount</Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', mt: 0.5 }}>₹{detailsDialog.data.net_amount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                <Chip label={detailsDialog.data.status} size="small" color={getStatusColor(detailsDialog.data.status)} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Payout Method</Typography>
                <Typography>{detailsDialog.data.payout_method}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Bank Account</Typography>
                <Typography>{detailsDialog.data.bank_account}</Typography>
              </Box>
              {detailsDialog.data.transaction_id && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Transaction ID</Typography>
                  <Typography sx={{ fontFamily: 'monospace' }}>{detailsDialog.data.transaction_id}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Period</Typography>
                <Typography>{detailsDialog.data.period}</Typography>
              </Box>
              {detailsDialog.data.payout_date && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Payout Date</Typography>
                  <Typography>{detailsDialog.data.payout_date}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Payout Modal */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>Add Retailer Payout - All Fields</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '70vh', overflow: 'auto' }}>
          {addDialog.data && (
            <>
              <TextField label="Retailer Name" value={addDialog.data.retailer_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, retailer_name: e.target.value } })} fullWidth />
              <TextField label="Retailer ID" value={addDialog.data.retailer_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, retailer_id: e.target.value } })} fullWidth required />
              <TextField label="Store ID" value={addDialog.data.store_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, store_id: e.target.value } })} fullWidth required />
              <TextField label="Period From" type="date" InputLabelProps={{ shrink: true }} value={addDialog.data.period_from} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, period_from: e.target.value } })} fullWidth required />
              <TextField label="Period To" type="date" InputLabelProps={{ shrink: true }} value={addDialog.data.period_to} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, period_to: e.target.value } })} fullWidth required />
              <TextField type="number" label="Total Orders" value={addDialog.data.total_orders} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, total_orders: parseInt(e.target.value) } })} fullWidth />
              <TextField type="number" label="Gross Payout Amount" value={addDialog.data.payout_amount} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, payout_amount: parseFloat(e.target.value) } })} fullWidth />
              <TextField type="number" label="Commission" value={addDialog.data.commission || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, commission: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Payout Reference" value={addDialog.data.payout_reference} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, payout_reference: e.target.value } })} fullWidth />
              <TextField
                label="Paid At"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={addDialog.data.paid_at}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, paid_at: e.target.value } })}
                fullWidth
              />
              <TextField select label="Status" value={addDialog.data.status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add Payout</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payout Modal */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Retailer Payout</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Retailer Name" value={editDialog.data.retailer_name} disabled fullWidth />
              <TextField type="number" label="Gross Payout Amount" value={editDialog.data.payout_amount} disabled fullWidth />
              <TextField select label="Status" value={editDialog.data.status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
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
        title="Delete Payout"
        description="This payout will be deleted. You have 10 seconds to undo this action."
        itemName={payoutToDelete?.retailer_name || 'Payout'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default RetailerPayouts;
