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
import { ridersAPI } from '../../services/apiService';

const RiderStatusManagement = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, data: null, reason: '' });
  const [actionRiderId, setActionRiderId] = useState(null);

  const loadPendingRiders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ridersAPI.getPending({ limit: 1000 });
      const pendingRiders = response?.data?.data || response?.data || [];
      setRiders(Array.isArray(pendingRiders) ? pendingRiders : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch rider approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRiders();
  }, []);

  const handleApprove = async (rider) => {
    setActionRiderId(rider._id);
    setError(null);

    try {
      await ridersAPI.approve(rider._id);
      await loadPendingRiders();
    } catch (err) {
      setError(err.message || 'Failed to approve rider');
    } finally {
      setActionRiderId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.data) return;

    setActionRiderId(rejectDialog.data._id);
    setError(null);

    try {
      await ridersAPI.reject(rejectDialog.data._id, rejectDialog.reason || 'Rejected by admin');
      setRejectDialog({ open: false, data: null, reason: '' });
      await loadPendingRiders();
    } catch (err) {
      setError(err.message || 'Failed to reject rider');
    } finally {
      setActionRiderId(null);
    }
  };

  const filteredRiders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return riders.filter((rider) => {
      const riderName = (rider.name || '').toLowerCase();
      const riderPhone = (rider.phone || '').toLowerCase();
      const riderEmail = (rider.email || '').toLowerCase();
      return riderName.includes(term) || riderPhone.includes(term) || riderEmail.includes(term);
    });
  }, [riders, searchTerm]);

  const stats = useMemo(() => ([
    { label: 'Pending Riders', value: riders.length, color: '#ed6c02' },
    {
      label: 'Submitted Today',
      value: riders.filter((rider) => rider.createdAt && new Date(rider.createdAt).toDateString() === new Date().toDateString()).length,
      color: '#2e7d32',
    },
    { label: 'Hidden From Delivery', value: riders.length, color: '#d32f2f' },
    { label: 'Search Matches', value: filteredRiders.length, color: '#1976d2' },
  ]), [filteredRiders.length, riders]);

  const getStatusColor = (rider) => {
    if (rider.is_approved) return 'success';
    if ((rider.status || '').toLowerCase() === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Rider Approval Queue</Typography>
          <Typography variant="body2" color="text.secondary">
            Review new riders before they can start delivery.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={loadPendingRiders} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {loading && <Typography sx={{ mb: 2 }}>Loading pending riders...</Typography>}
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
            placeholder="Search by rider name, phone, or email..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 160 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRiders.map((rider) => (
                  <TableRow key={rider._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{rider.name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        KYC: {rider.kyc_status || 'pending'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{rider.phone || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">{rider.email || '-'}</Typography>
                    </TableCell>
                    <TableCell>{rider.vehicle_type || '-'}</TableCell>
                    <TableCell>{rider.createdAt ? new Date(rider.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={rider.is_approved ? 'approved' : (rider.status || 'pending').toLowerCase()}
                        color={getStatusColor(rider)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => setDetailsDialog({ open: true, data: rider })} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(rider)}
                        title="Approve Rider"
                        disabled={actionRiderId === rider._id}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setRejectDialog({ open: true, data: rider, reason: '' })}
                        title="Reject Rider"
                        disabled={actionRiderId === rider._id}
                      >
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredRiders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending riders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Rider Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography sx={{ fontWeight: 700 }}>{detailsDialog.data.name || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography>{detailsDialog.data.phone || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography>{detailsDialog.data.email || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Vehicle</Typography>
                <Typography>{detailsDialog.data.vehicle_type || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">KYC Status</Typography>
                <Typography>{detailsDialog.data.kyc_status || 'pending'}</Typography>
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Reject Rider</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            Add a reason so the rider knows what to fix before resubmitting.
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
            disabled={actionRiderId === rejectDialog.data?._id}
          >
            Reject Rider
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RiderStatusManagement;
