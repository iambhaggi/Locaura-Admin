import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  Search,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Add,
  Refresh,
  Person,
} from '@mui/icons-material';
import { getAppRiderPayouts } from '../api/endpoints';
import { payoutsAPI } from '../services/apiService';
import { ClickableName } from '../utils/navigationHelpers';
import RiderPayoutsProfile from '../components/RiderPayoutsProfile/RiderPayoutsProfile';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

const AppRiderPayouts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const detailId = searchParams.get('id');
  
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [payoutToDelete, setPayoutToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedPayout, setDeletedPayout] = useState(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        search: searchTerm || undefined,
      };
      const response = await getAppRiderPayouts(params);
      setPayouts(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to fetch rider payouts');
      console.error('Error fetching rider payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, searchTerm]);

  // Handle opening detail view from URL parameter
  useEffect(() => {
    if (detailId && payouts.length > 0) {
      const payout = payouts.find(p => p._id === detailId || p.id === detailId);
      if (payout) {
        setSelectedPayout(payout);
        setProfileDialog(true);
      }
    }
  }, [detailId, payouts]);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  }, []);

  const handleMenuOpen = useCallback((event, payout) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPayout(payout);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedPayout(null);
  }, []);

  const handleCloseDetail = () => {
    setProfileDialog(false);
    setSelectedPayout(null);
    navigate('/rider-payouts');
  };

  const handleViewDetails = useCallback(() => {
    setProfileDialog(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (!selectedPayout) return;
    
    try {
      setPayouts(prev => prev.map(payout => 
        payout._id === selectedPayout._id 
          ? { ...payout, status: newStatus }
          : payout
      ));
      
      handleMenuClose();
    } catch (error) {
      console.error('Error updating payout status:', error);
    }
  }, [selectedPayout, handleMenuClose]);

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit payout:', selectedPayout);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setPayoutToDelete(selectedPayout);
    setDeleteDialog(true);
    setIsDeleted(false);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!payoutToDelete) return;

    try {
      await payoutsAPI.delete(payoutToDelete._id);
      setDeletedPayout(payoutToDelete);
      setIsDeleted(true);
      setPayouts(payouts.filter(p => p._id !== payoutToDelete._id));
      setDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting payout:', err);
      setError('Failed to delete payout');
      setDeleteDialog(false);
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

  const handleProfileClose = () => {
    setProfileDialog(false);
    setSelectedPayout(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  const displayPayouts = payouts;

  if (loading && payouts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Payouts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchPayouts}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              placeholder="Search payouts..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Typography variant="body2" color="text.secondary">
              {displayPayouts.length} payouts
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rider ID</TableCell>
                  <TableCell>Total Deliveries</TableCell>
                  <TableCell>Total Earnings</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Payout Reference</TableCell>
                  <TableCell>Paid At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayPayouts.map((payout) => (
                  <TableRow key={payout._id || payout.id}>
                    <TableCell>
                      <ClickableName
                        name={payout.rider_id || 'N/A'}
                        entityType="rider"
                        entityId={payout.rider_id || 'unknown'}
                      />
                    </TableCell>
                    <TableCell>{payout.total_deliveries ?? 0}</TableCell>
                    <TableCell>₹{payout.total_earnings ?? 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status || 'pending'}
                        color={getStatusColor(payout.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payout.period?.from && payout.period?.to ?
                        `${new Date(payout.period.from).toLocaleDateString()} - ${new Date(payout.period.to).toLocaleDateString()}` :
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>{payout.payout_reference || 'N/A'}</TableCell>
                    <TableCell>
                      {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : 'Not paid'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status || 'pending'}
                        color={getStatusColor(payout.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payout.period?.from && payout.period?.to ?
                        `${new Date(payout.period.from).toLocaleDateString()} - ${new Date(payout.period.to).toLocaleDateString()}` :
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : 'Not paid'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, payout)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewDetails}>
              <Person sx={{ mr: 1 }} />
              View Details
            </MenuItem>
            {selectedPayout?.status === 'pending' ? (
              <MenuItem onClick={() => handleStatusChange(selectedPayout._id, 'completed')}>
                <CheckCircle sx={{ mr: 1 }} />
                Mark Completed
              </MenuItem>
            ) : selectedPayout?.status === 'completed' ? (
              <MenuItem onClick={() => handleStatusChange(selectedPayout._id, 'failed')}>
                <Block sx={{ mr: 1 }} />
                Mark Failed
              </MenuItem>
            ) : null}
            <MenuItem onClick={handleEdit}>
              <Edit sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <Delete sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>

          {payouts.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                Showing sample payout rows for visual reference
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <RiderPayoutsProfile
        payout={selectedPayout}
        open={profileDialog}
        onClose={handleCloseDetail}
      />

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Payout"
        description="This will remove the payout record. You can undo within 10 seconds."
        itemName={`Payout - ${payoutToDelete?.rider_id || 'Payout'}`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
        timeout={10}
      />
    </Box>
  );
};

export default AppRiderPayouts;