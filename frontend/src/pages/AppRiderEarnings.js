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
import { getAppRiderEarnings } from '../api/endpoints';
import { ClickableName } from '../utils/navigationHelpers';
import RiderEarningsProfile from '../components/RiderEarningsProfile/RiderEarningsProfile';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

const formatOrderRef = (order) => {
  if (!order) return 'N/A';
  if (typeof order === 'string') return order;
  return order.order_number || order.orderNumber || order._id || 'N/A';
};

const getOrderEntityId = (order) => {
  if (!order) return 'unknown';
  if (typeof order === 'string') return order;
  return order._id || order.order_number || 'unknown';
};

const AppRiderEarnings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const detailId = searchParams.get('id');
  
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [earningToDelete, setEarningToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedEarning, setDeletedEarning] = useState(null);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        search: searchTerm || undefined,
      };
      const response = await getAppRiderEarnings(params);
      setEarnings(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to fetch rider earnings');
      console.error('Error fetching rider earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [page, searchTerm]);

  // Handle opening detail view from URL parameter
  useEffect(() => {
    if (detailId && earnings.length > 0) {
      const earning = earnings.find(e => e._id === detailId || e.id === detailId);
      if (earning) {
        setSelectedEarning(earning);
        setProfileDialog(true);
      }
    }
  }, [detailId, earnings]);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  }, []);

  const handleMenuOpen = useCallback((event, earning) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEarning(earning);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedEarning(null);
  }, []);

  const handleCloseDetail = () => {
    setProfileDialog(false);
    setSelectedEarning(null);
    navigate('/rider-earnings');
  };

  const handleViewDetails = useCallback(() => {
    if (selectedEarning) {
      setSelectedEarning(selectedEarning);  // Actually use the selected earning
      setProfileDialog(true);
    }
    handleMenuClose();
  }, [handleMenuClose, selectedEarning]);

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit earning:', selectedEarning);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setEarningToDelete(selectedEarning);
    setDeleteDialog(true);
    setIsDeleted(false);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (earningToDelete) {
      setDeletedEarning(earningToDelete);
      setIsDeleted(true);
      setEarnings(earnings.filter(e => e._id !== earningToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedEarning) {
      setEarnings([...earnings, deletedEarning]);
      setDeleteDialog(false);
      setDeletedEarning(null);
      setEarningToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setEarningToDelete(null);
    }
  };

  const handleProfileClose = () => {
    setProfileDialog(false);
    setSelectedEarning(null);
  };

  const displayEarnings = earnings;

  if (loading && earnings.length === 0) {
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
          Rider Earnings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchEarnings}
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
              placeholder="Search earnings..."
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
              {displayEarnings.length} earnings records
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rider ID</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Delivery Fee Earned</TableCell>
                  <TableCell>Bonus</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Settled At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayEarnings.map((earning) => (
                  <TableRow key={earning._id || earning.id}>
                    <TableCell>
                      <ClickableName
                        name={earning.rider_id || 'N/A'}
                        entityType="rider"
                        entityId={earning.rider_id || 'unknown'}
                      />
                    </TableCell>
                    <TableCell>
                      <ClickableName
                        name={formatOrderRef(earning.order_id)}
                        entityType="order"
                        entityId={getOrderEntityId(earning.order_id)}
                      />
                    </TableCell>
                    <TableCell>₹{earning.delivery_fee_earned || 0}</TableCell>
                    <TableCell>₹{earning.bonus || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={earning.status || 'pending'}
                        color={earning.status === 'settled' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {earning.settled_at ? new Date(earning.settled_at).toLocaleDateString() : 'Not settled'}
                    </TableCell>
                    <TableCell>
                      {earning.createdAt ? new Date(earning.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, earning)}>
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
            <MenuItem onClick={handleEdit}>
              <Edit sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <Delete sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>

          {earnings.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                Showing sample rider earnings for visual reference
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <RiderEarningsProfile
        earning={selectedEarning}
        open={profileDialog}
        onClose={handleCloseDetail}
      />

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Earning Record"
        description="This will remove the earning record. You can undo within 10 seconds."
        itemName={`Earning - ${earningToDelete?.delivery_fee_earned || 'Record'}`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Box>
  );
};

export default AppRiderEarnings;