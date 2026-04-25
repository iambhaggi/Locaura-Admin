import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { retailersAPI } from '../services/apiService';
import RetailerProfile from '../components/RetailerProfile/RetailerProfile';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { ClickableName } from '../utils/navigationHelpers';

const AppRetailers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const detailId = searchParams.get('id');
  
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [selectedRetailerProfile, setSelectedRetailerProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [retailerToDelete, setRetailerToDelete] = useState(null);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        search: searchTerm || undefined,
      };
      const response = await retailersAPI.getAll(params);
      setRetailers(response.data?.data || response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1);
      }
    } catch (err) {
      setError('Failed to fetch retailers');
      console.error('Error fetching retailers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, [page, searchTerm]);

  // Handle opening detail view from URL parameter
  useEffect(() => {
    if (detailId && retailers.length > 0) {
      const retailer = retailers.find(r => r._id === detailId || r.id === detailId);
      if (retailer) {
        setSelectedRetailerProfile(retailer);
        setProfileDialog(true);
      }
    }
  }, [detailId, retailers]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleMenuOpen = (event, retailer) => {
    setAnchorEl(event.currentTarget);
    setSelectedRetailer(retailer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRetailer(null);
  };

  const handleCloseDetail = () => {
    setProfileDialog(false);
    setSelectedRetailerProfile(null);
    navigate('/retailers');
  };

  const handleViewDetails = (retailer) => {
    setSelectedRetailerProfile(retailer);
    setProfileDialog(true);
    handleMenuClose();
  };

  const handleStatusChange = (retailerId, newStatus) => {
    setRetailers(retailers.map(retailer => 
      (retailer._id || retailer.id) === retailerId ? { ...retailer, status: newStatus } : retailer
    ));
    handleMenuClose();
  };

  const handleDeleteClick = (retailer) => {
    setRetailerToDelete(retailer);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!retailerToDelete) return;

    try {
      await retailersAPI.delete(retailerToDelete._id || retailerToDelete.id);
      setRetailers(retailers.filter(retailer => 
        (retailer._id || retailer.id) !== (retailerToDelete._id || retailerToDelete.id)
      ));
      setDeleteDialogOpen(false);
      setRetailerToDelete(null);
    } catch (err) {
      console.error('Error deleting retailer:', err);
      setError('Failed to delete retailer');
      setDeleteDialogOpen(false);
      setRetailerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRetailerToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const displayRetailers = retailers;

  if (loading && retailers.length === 0) {
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
          App Retailers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchRetailers}
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
              placeholder="Search retailers..."
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
              {displayRetailers.length} retailers
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Phone</TableCell>
                  <TableCell>Phone Verified</TableCell>
                  <TableCell>Email Verified</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRetailers.map((retailer) => (
                  <TableRow key={retailer._id || retailer.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }}>
                          {retailer.phone?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        <ClickableName
                          name={retailer.phone || 'N/A'}
                          entityType="retailer"
                          entityId={retailer._id || retailer.id}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{retailer.email || 'N/A'}</TableCell>
                    <TableCell>{retailer.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={retailer.phone_verified ? 'Verified' : 'Unverified'}
                        color={retailer.phone_verified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={retailer.email_verified ? 'Verified' : 'Unverified'}
                        color={retailer.email_verified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, retailer)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {retailers.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                Showing sample retailer rows for visual reference
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedRetailer)}>
          <CheckCircle sx={{ mr: 1, color: 'primary.main' }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedRetailer?._id || selectedRetailer?.id, 'active')}>
          <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
          Activate
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedRetailer?._id || selectedRetailer?.id, 'inactive')}>
          <Block sx={{ mr: 1, color: 'error.main' }} />
          Deactivate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedRetailer)}>
          <Delete sx={{ mr: 1, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      <RetailerProfile 
        retailer={selectedRetailerProfile} 
        open={profileDialog} 
        onClose={handleCloseDetail} 
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Retailer"
        itemName={`Retailer - ${retailerToDelete?.phone || 'Retailer'}`}
        timeout={10}
      />
    </Box>
  );
};

export default AppRetailers;