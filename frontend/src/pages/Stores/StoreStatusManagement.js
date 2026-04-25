import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Search as SearchIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { storesAPI } from '../../services/apiService';

const StoreStatusManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, data: null, reason: '' });
  const [actionStoreId, setActionStoreId] = useState(null);

  const loadPendingStores = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await storesAPI.getPending({ limit: 1000 });
      const pendingStores = response?.data?.data || response?.data || [];
      setStores(Array.isArray(pendingStores) ? pendingStores : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch store approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingStores();
  }, []);

  const handleApprove = async (store) => {
    setActionStoreId(store._id);
    setError(null);

    try {
      await storesAPI.approve(store._id);
      await loadPendingStores();
    } catch (err) {
      setError(err.message || 'Failed to approve store');
    } finally {
      setActionStoreId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.data) {
      return;
    }

    setActionStoreId(rejectDialog.data._id);
    setError(null);

    try {
      await storesAPI.reject(rejectDialog.data._id, rejectDialog.reason || 'Rejected by admin');
      setRejectDialog({ open: false, data: null, reason: '' });
      await loadPendingStores();
    } catch (err) {
      setError(err.message || 'Failed to reject store');
    } finally {
      setActionStoreId(null);
    }
  };

  const filteredStores = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return stores.filter((store) => {
      const storeName = (store.store_name || '').toLowerCase();
      const storeEmail = (store.store_email || '').toLowerCase();
      const retailerId = String(store.retailer_id || '').toLowerCase();
      return storeName.includes(term) || storeEmail.includes(term) || retailerId.includes(term);
    });
  }, [searchTerm, stores]);

  const stats = useMemo(() => ([
    { label: 'Pending Stores', value: stores.length, color: '#ed6c02' },
    {
      label: 'Submitted Today',
      value: stores.filter((store) => {
        if (!store.createdAt) return false;
        const createdDate = new Date(store.createdAt).toDateString();
        return createdDate === new Date().toDateString();
      }).length,
      color: '#2e7d32',
    },
    { label: 'Hidden From App', value: stores.length, color: '#d32f2f' },
    { label: 'Search Matches', value: filteredStores.length, color: '#1976d2' },
  ]), [filteredStores.length, stores]);

  const getStatusColor = (store) => {
    if (store.is_approved) return 'success';
    if ((store.status || '').toLowerCase() === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Store Approval Queue</Typography>
          <Typography variant="body2" color="text.secondary">
            Review new retailer stores before they become visible in the app.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={loadPendingStores} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {loading && <Typography sx={{ mb: 2 }}>Loading pending stores...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h4" sx={{ color: stat.color, mt: 1, fontWeight: 700 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by store name, email, or retailer id..."
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
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Retailer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 160 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{store.store_name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {store.store_email || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{String(store.retailer_id || '-')}</TableCell>
                    <TableCell>{store.store_phone || '-'}</TableCell>
                    <TableCell>{store.createdAt ? new Date(store.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={store.is_approved ? 'approved' : (store.status || 'pending').toLowerCase()}
                        color={getStatusColor(store)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => setDetailsDialog({ open: true, data: store })} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(store)}
                        title="Approve Store"
                        disabled={actionStoreId === store._id}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setRejectDialog({ open: true, data: store, reason: '' })}
                        title="Reject Store"
                        disabled={actionStoreId === store._id}
                      >
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending stores found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Store Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Store Name</Typography>
                <Typography sx={{ fontWeight: 700 }}>{detailsDialog.data.store_name || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography>{detailsDialog.data.store_email || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography>{detailsDialog.data.store_phone || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Retailer ID</Typography>
                <Typography>{String(detailsDialog.data.retailer_id || '-')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Submitted On</Typography>
                <Typography>{detailsDialog.data.createdAt ? new Date(detailsDialog.data.createdAt).toLocaleString() : '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Current Status</Typography>
                <Chip
                  label={detailsDialog.data.is_approved ? 'approved' : (detailsDialog.data.status || 'pending').toLowerCase()}
                  color={getStatusColor(detailsDialog.data)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              {detailsDialog.data.rejection_reason && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Rejection Reason</Typography>
                  <Typography color="error">{detailsDialog.data.rejection_reason}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, data: null, reason: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Reject Store</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Add a reason so the retailer knows what must be corrected before resubmitting.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Rejection reason"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog((current) => ({ ...current, reason: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, data: null, reason: '' })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={actionStoreId === rejectDialog.data?._id}
          >
            Reject Store
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreStatusManagement;
