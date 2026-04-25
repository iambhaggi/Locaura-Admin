import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  Search,
  Delete,
  Edit,
  Add,
  LocationOn,
  Map,
  Home,
  Business,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { consumersAPI } from '../../services/apiService';

const sampleAddresses = [];

const ConsumerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(false);
  const [labelFilter, setLabelFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedAddress, setDeletedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter addresses
  const filteredAddresses = addresses.filter((addr) => {
    const name = addr.consumer_name || '';
    const line1 = addr.line1 || '';
    const city = addr.city || '';
    const pincode = addr.pincode || '';
    const label = addr.label || '';

    const matchesSearch =
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      line1.toLowerCase().includes(searchText.toLowerCase()) ||
      city.toLowerCase().includes(searchText.toLowerCase()) ||
      pincode.includes(searchText);

    const matchesLabel = labelFilter === 'all' || label === labelFilter;
    return matchesSearch && matchesLabel;
  });

  const handleActionClick = (event, address) => {
    setAnchorEl(event.currentTarget);
    setSelectedAddress(address);
    setOpenActionMenu(true);
  };

  const handleCloseActionMenu = () => {
    setOpenActionMenu(false);
    setAnchorEl(null);
  };

  const handleViewDetails = (address) => {
    setSelectedAddress(address);
    setOpenDetailDialog(true);
    handleCloseActionMenu();
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await consumersAPI.getAll({ limit: 1000 });
      const consumers = response.data?.data || response.data || response || [];
      const allAddresses = Array.isArray(consumers)
        ? consumers.flatMap((consumer) =>
            (consumer.addresses || []).map((address) => ({
              ...address,
              consumer_id: consumer._id,
              consumer_name: consumer.consumer_name || 'Unknown',
              consumer_email: consumer.email || '',
              consumer_phone: consumer.phone || '',
              createdAt: address.createdAt || consumer.createdAt,
              updatedAt: address.updatedAt || consumer.updatedAt,
            }))
          )
        : [];
      setAddresses(allAddresses);
    } catch (err) {
      console.error('Error fetching consumer addresses:', err);
      setError('Unable to load consumer addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedAddress(null);
  };

  const handleSetDefault = (addressId) => {
    const consumerId = addresses.find((a) => a._id === addressId)?.consumer_id;
    setAddresses(
      addresses.map((a) => ({
        ...a,
        is_default: a.consumer_id === consumerId && a._id === addressId ? true : false,
      }))
    );
    handleCloseActionMenu();
  };

  const handleDelete = (address) => {
    setTimeout(() => {
      setAddressToDelete(address);
      setDeleteDialog(true);
      setIsDeleted(false);
    }, 100);
  };

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      setDeletedAddress(addressToDelete);
      setIsDeleted(true);
      setAddresses(addresses.filter(a => a._id !== addressToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedAddress) {
      setAddresses([...addresses, deletedAddress]);
      setDeleteDialog(false);
      setDeletedAddress(null);
      setAddressToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setAddressToDelete(null);
    }
  };

  const getAddressIcon = (label) => {
    switch (label) {
      case 'Home':
        return <Home sx={{ color: '#4CAF50' }} />;
      case 'Office':
        return <Business sx={{ color: '#2196F3' }} />;
      default:
        return <LocationOn sx={{ color: '#FF9800' }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📍 Consumer Addresses
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Manage delivery addresses for all consumers
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} sx={{ background: '#2196F3' }}>
          Add Address
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E3F2FD' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              {addresses.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1976D2' }}>
              Total Addresses
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#C8E6C9' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {addresses.filter((a) => a.label === 'Home').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#388E3C' }}>
              Home Addresses
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#BBDEFB' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              {addresses.filter((a) => a.label === 'Office').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1565C0' }}>
              Office Addresses
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#F0F4C3' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FBC02D' }}>
              {addresses.filter((a) => a.is_default).length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#F57F17' }}>
              Default Addresses
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search by name, city, street, or pincode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ background: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                size="small"
                sx={{ background: '#f5f5f5' }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Full Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>State & Pincode</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Default</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAddresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Alert severity="info">No addresses found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredAddresses.map((address) => (
                <TableRow key={address._id} sx={{ '&:hover': { background: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, background: '#2196F3' }}>
                        {address.consumer_name?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {address.consumer_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          ID: {address.consumer_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getAddressIcon(address.label)}
                      <Chip label={address.label} size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {address.line1}
                    </Typography>
                    {address.line2 && (
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {address.line2}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{address.city}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {address.state} - {address.pincode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {address.is_default ? (
                      <Chip label="Default" color="warning" size="small" />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, address)}
                      sx={{ color: '#2196F3' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={openActionMenu} onClose={handleCloseActionMenu}>
        <MenuItem onClick={() => handleViewDetails(selectedAddress)}>
          <Map sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleViewDetails(selectedAddress)}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        {selectedAddress && !selectedAddress.is_default && (
          <MenuItem onClick={() => handleSetDefault(selectedAddress._id)}>
            <Chip label="★" sx={{ mr: 1 }} /> Set as Default
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleDelete(selectedAddress); }} sx={{ color: '#d32f2f' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      {selectedAddress && (
        <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: '#2196F3', color: 'white', fontWeight: 'bold' }}>
            📍 Address Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Consumer Info */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Consumer
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedAddress.consumer_name}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Address Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Address Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedAddress.label} {selectedAddress.is_default && '(Default)'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Address Line 1
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedAddress.line1}
                </Typography>
              </Grid>

              {selectedAddress.line2 && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    Address Line 2
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedAddress.line2}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  City
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedAddress.city}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  State
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedAddress.state}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Pincode
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedAddress.pincode}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Coordinates
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedAddress.location?.coordinates?.length === 2
                    ? `${selectedAddress.location.coordinates[1].toFixed(4)}, ${selectedAddress.location.coordinates[0].toFixed(4)}`
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Created
                </Typography>
                <Typography variant="body2">
                  {selectedAddress.createdAt ? new Date(selectedAddress.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {selectedAddress.updatedAt ? new Date(selectedAddress.updatedAt).toLocaleDateString('en-IN') : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
            <Button onClick={handleCloseDetailDialog} sx={{ color: '#999' }}>
              Close
            </Button>
            <Button variant="contained" sx={{ background: '#2196F3' }}>
              Edit Address
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Address"
        description="This address will be deleted. You have 10 seconds to undo this action."
        itemName={addressToDelete?.label || 'Address'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Box>
  );
};

export default ConsumerAddresses;
