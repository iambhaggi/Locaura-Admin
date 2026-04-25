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
import { getAppRiderPayouts, getAppRiderEarnings } from '../../api/endpoints';

const RiderPayouts = () => {
  const location = useLocation();
  const [records, setRecords] = useState([]);
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

  const isEarningsPage = location.pathname.endsWith('/earnings');
  const title = isEarningsPage ? 'Rider Earnings' : 'Rider Payouts';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: 1000 };
        const response = isEarningsPage
          ? await getAppRiderEarnings(params)
          : await getAppRiderPayouts(params);
        setRecords(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        console.error('Error fetching rider records:', err);
        setError(err.message || 'Failed to load rider records');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEarningsPage]);

  const [filteredRecords, setFilteredRecords] = useState([]);

  const formatOrderRef = (order) => {
    if (!order) return '';
    if (typeof order === 'string') return order;
    return order.order_number || order.orderNumber || order._id || '';
  };

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    setFilteredRecords(records.filter((record) => {
      const riderId = record.rider_id?.toString().toLowerCase() || '';
      const orderId = formatOrderRef(record.order_id).toLowerCase();
      const reference = record.payout_reference?.toString().toLowerCase() || '';
      const status = record.status?.toLowerCase() || '';
      return (
        riderId.includes(query) ||
        orderId.includes(query) ||
        reference.includes(query) ||
        status.includes(query)
      );
    }));
  }, [records, searchTerm]);

  const formatEntityRef = (entity) => {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return entity.order_number || entity.orderNumber || entity.name || entity._id || '';
  };

  const handleViewDetails = (record) => {
    setDetailsDialog({ open: true, data: record });
  };

  const handleDeleteRecord = (record) => {
    setPayoutToDelete(record);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (payoutToDelete) {
      setDeletedPayout(payoutToDelete);
      setIsDeleted(true);
      setRecords(records.filter((r) => r._id !== payoutToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedPayout) {
      setRecords([...records, deletedPayout]);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'settled':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const stats = isEarningsPage
    ? [
        { label: 'Total Earnings Records', value: records.length, color: '#3f51b5' },
        { label: 'Total Delivery Fee', value: '₹' + records.reduce((sum, r) => sum + (r.delivery_fee_earned || 0), 0), color: '#4caf50' },
        { label: 'Settled', value: records.filter((r) => r.status === 'settled').length, color: '#1976d2' },
        { label: 'Total Bonus', value: '₹' + records.reduce((sum, r) => sum + (r.bonus || 0), 0), color: '#ff9800' },
      ]
    : [
        { label: 'Total Payout Runs', value: records.length, color: '#3f51b5' },
        { label: 'Total Earnings', value: '₹' + records.reduce((sum, r) => sum + (r.total_earnings || 0), 0), color: '#4caf50' },
        { label: 'Pending', value: records.filter((r) => r.status === 'pending').length, color: '#ff9800' },
        { label: 'Paid', value: records.filter((r) => r.status === 'paid').length, color: '#1976d2' },
      ];

  const titleLabel = isEarningsPage ? 'Rider Earnings' : 'Rider Payouts';
  const subtitle = isEarningsPage ? 'Delivery earnings records for riders' : 'Payout settlements for riders';

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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{titleLabel}</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>{subtitle}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialog({ open: true, data: { rider_id: '', order_id: '', delivery_fee_earned: 0, bonus: 0, status: 'pending', total_deliveries: 0, total_earnings: 0 } })}>
          Add Record
        </Button>
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
            placeholder="Search by rider ID, order ID, reference, or status..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Rider ID</TableCell>
                  {isEarningsPage ? (
                    <>
                      <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Delivery Fee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Bonus</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Settled At</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total Deliveries</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total Earnings</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Paid At</TableCell>
                    </>
                  )}
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record._id || record.order_id || record.rider_id} hover>
                    <TableCell>{record.rider_id}</TableCell>
                    {isEarningsPage ? (
                      <>
                        <TableCell>{formatOrderRef(record.order_id) || '-'}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>₹{record.delivery_fee_earned}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>₹{record.bonus}</TableCell>
                        <TableCell>
                          <Chip label={record.status} size="small" color={getStatusColor(record.status)} />
                        </TableCell>
                        <TableCell>{record.settled_at ? new Date(record.settled_at).toLocaleDateString() : '-'}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ textAlign: 'center' }}>{record.total_deliveries}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>₹{record.total_earnings}</TableCell>
                        <TableCell>
                          <Chip label={record.status} size="small" color={getStatusColor(record.status)} />
                        </TableCell>
                        <TableCell>{record.period?.from ? `${new Date(record.period.from).toLocaleDateString()} - ${new Date(record.period.to).toLocaleDateString()}` : '-'}</TableCell>
                        <TableCell>{record.payout_reference || '-'}</TableCell>
                        <TableCell>{record.paid_at ? new Date(record.paid_at).toLocaleDateString() : '-'}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(record)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteRecord(record)} title="Delete">
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

      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Rider {isEarningsPage ? 'Earning' : 'Payout'} Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Rider ID</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{formatEntityRef(detailsDialog.data.rider_id) || 'N/A'}</Typography>
              </Box>
              {isEarningsPage ? (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Order ID</Typography>
                    <Typography>{formatEntityRef(detailsDialog.data.order_id) || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Delivery Fee Earned</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>₹{detailsDialog.data.delivery_fee_earned}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Bonus</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>₹{detailsDialog.data.bonus}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                    <Chip label={detailsDialog.data.status} size="small" color={getStatusColor(detailsDialog.data.status)} sx={{ mt: 0.5 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Settled At</Typography>
                    <Typography>{detailsDialog.data.settled_at ? new Date(detailsDialog.data.settled_at).toLocaleDateString() : '-'}</Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Period</Typography>
                    <Typography>{detailsDialog.data.period?.from ? `${new Date(detailsDialog.data.period.from).toLocaleDateString()} - ${new Date(detailsDialog.data.period.to).toLocaleDateString()}` : '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Total Deliveries</Typography>
                    <Typography>{detailsDialog.data.total_deliveries}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Total Earnings</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>₹{detailsDialog.data.total_earnings}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Reference</Typography>
                    <Typography>{detailsDialog.data.payout_reference || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Paid At</Typography>
                    <Typography>{detailsDialog.data.paid_at ? new Date(detailsDialog.data.paid_at).toLocaleDateString() : '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                    <Chip label={detailsDialog.data.status} size="small" color={getStatusColor(detailsDialog.data.status)} sx={{ mt: 0.5 }} />
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Record"
        description="This record will be deleted. You have 10 seconds to undo this action."
        itemName={payoutToDelete?.rider_id || 'Record'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default RiderPayouts;
