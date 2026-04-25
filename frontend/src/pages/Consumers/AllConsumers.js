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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
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
  Visibility,
  Email,
  Phone,
  LocationOn,
  ShoppingCart,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { consumersAPI } from '../../services/apiService';

const sampleConsumers = [];

const AllConsumers = () => {
  const [consumers, setConsumers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    consumer_name: '',
    email: '',
    phone: '',
    status: 'active',
    phone_verified: false,
    otp: '',
    otp_expiry: '',
    fcm_token: '',
    addresses_json: '[]',
    cart_json: '{}',
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [consumerToDelete, setConsumerToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedConsumer, setDeletedConsumer] = useState(null);

  // Filter consumers based on search and status
  const filteredConsumers = consumers.filter((consumer) => {
    const name = consumer.consumer_name || '';
    const phone = consumer.phone || '';
    const email = consumer.email || '';
    const matchesSearch =
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.includes(searchText) ||
      email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consumer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleActionClick = (event, consumer) => {
    setAnchorEl(event.currentTarget);
    setSelectedConsumer(consumer);
    setOpenActionMenu(true);
  };

  const handleCloseActionMenu = () => {
    setOpenActionMenu(false);
    setAnchorEl(null);
  };

  const handleViewDetails = (consumer) => {
    setSelectedConsumer(consumer);
    setOpenDetailDialog(true);
    handleCloseActionMenu();
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedConsumer(null);
  };

  const handleChangeStatus = (newStatus) => {
    if (selectedConsumer) {
      setConsumers(
        consumers.map((c) =>
          c._id === selectedConsumer._id ? { ...c, status: newStatus } : c
        )
      );
    }
    handleCloseActionMenu();
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersAPI.getAll();
      const consumersList = response.data?.data || response.data || response || [];
      setConsumers(Array.isArray(consumersList) ? consumersList : []);
    } catch (error) {
      console.error('Failed to load consumers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, []);

  const handleDelete = (consumer) => {
    setConsumerToDelete(consumer);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = async () => {
    if (!consumerToDelete) return;

    try {
      await consumersAPI.delete(consumerToDelete._id);
      setDeletedConsumer(consumerToDelete);
      setIsDeleted(true);
      setConsumers(consumers.filter(c => c._id !== consumerToDelete._id));
    } catch (error) {
      console.error('Failed to delete consumer:', error);
      setDeleteDialog(false);
      setConsumerToDelete(null);
    }
  };

  const handleUndoDelete = () => {
    if (deletedConsumer) {
      setConsumers([...consumers, deletedConsumer]);
      setDeleteDialog(false);
      setIsDeleted(false);
      setConsumerToDelete(null);
      setDeletedConsumer(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setConsumerToDelete(null);
    }
  };

  const handleAddConsumer = () => {
    setFormData({
      consumer_name: '',
      email: '',
      phone: '',
      status: 'active',
      phone_verified: false,
      otp: '',
      otp_expiry: '',
      fcm_token: '',
      addresses_json: '[]',
      cart_json: '{}',
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormData({
      consumer_name: '',
      email: '',
      phone: '',
      status: 'active',
      phone_verified: false,
      otp: '',
      otp_expiry: '',
      fcm_token: '',
      addresses_json: '[]',
      cart_json: '{}',
    });
  };

  const handleEditConsumer = () => {
    if (selectedConsumer) {
      setFormData({
        consumer_name: selectedConsumer.consumer_name,
        email: selectedConsumer.email,
        phone: selectedConsumer.phone,
      });
      setOpenEditDialog(true);
      handleCloseActionMenu();
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setFormData({ consumer_name: '', email: '', phone: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveConsumer = async () => {
    if (!formData.consumer_name || !formData.email || !formData.phone) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      if (openAddDialog) {
        let parsedAddresses = [];
        let parsedCart = {};

        try {
          parsedAddresses = formData.addresses_json ? JSON.parse(formData.addresses_json) : [];
          parsedCart = formData.cart_json ? JSON.parse(formData.cart_json) : {};
        } catch (parseError) {
          alert('Addresses/Cart JSON is invalid. Please enter valid JSON.');
          return;
        }

        const response = await consumersAPI.create({
          consumer_name: formData.consumer_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status || 'active',
          phone_verified: Boolean(formData.phone_verified),
          otp: formData.otp || '',
          otp_expiry: formData.otp_expiry || null,
          fcm_token: formData.fcm_token || '',
          addresses: Array.isArray(parsedAddresses) ? parsedAddresses : [],
          cart: parsedCart && typeof parsedCart === 'object' ? parsedCart : {},
        });
        const createdConsumer = response.data?.data || response.data;
        setConsumers([createdConsumer, ...consumers]);
        alert('Consumer added successfully');
        handleCloseAddDialog();
      } else if (openEditDialog) {
        setConsumers(consumers.map(c => c._id === selectedConsumer._id ? { ...c, ...formData } : c));
        alert('Consumer updated successfully');
        handleCloseEditDialog();
        setOpenDetailDialog(false);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchConsumers();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVerificationIcon = (isVerified) => {
    return isVerified ? (
      <CheckCircle sx={{ color: 'green', fontSize: 18 }} />
    ) : (
      <Block sx={{ color: 'red', fontSize: 18 }} />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            👥 All Consumers
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Manage and view all customer accounts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddConsumer} sx={{ background: '#2196F3' }}>
            Add Consumer
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E3F2FD' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              {consumers.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1976D2' }}>
              Total Consumers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#F3E5F5' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
              {consumers.filter((c) => c.phone_verified).length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#7B1FA2' }}>
              Verified
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E8F5E9' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {consumers.filter((c) => c.status === 'active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#388E3C' }}>
              Active
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#FFF3E0' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              {consumers.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#E65100' }}>
              Addresses
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, or email..."
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ background: '#f5f5f5' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <TableContainer component={Card}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && (
          <Table>
            <TableHead sx={{ background: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Verified</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Addresses</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConsumers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Alert severity="info">No consumers found</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsumers.map((consumer) => (
                  <TableRow key={consumer._id} sx={{ '&:hover': { background: '#f9f9f9' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, background: '#2196F3' }}>
                          {consumer.consumer_name?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {consumer.consumer_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16, color: '#666' }} />
                        {consumer.phone}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 16, color: '#666' }} />
                        {consumer.email}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getVerificationIcon(consumer.phone_verified)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={consumer.status}
                        color={getStatusColor(consumer.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                        {consumer.addresses?.length || 0}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '12px', color: '#999' }}>
                        {new Date(consumer.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, consumer)}
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
        )}
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={openActionMenu} onClose={handleCloseActionMenu}>
        <MenuItem onClick={() => handleViewDetails(selectedConsumer)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleEditConsumer}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('suspended')}>
          <Block sx={{ mr: 1 }} /> Suspend
        </MenuItem>
        <MenuItem onClick={() => { handleDelete(selectedConsumer); }} sx={{ color: '#d32f2f' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      {selectedConsumer && (
        <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ background: '#2196F3', color: 'white', fontWeight: 'bold' }}>
            👤 Consumer Details - {selectedConsumer.consumer_name}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Consumer ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedConsumer._id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedConsumer.consumer_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedConsumer.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Phone
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedConsumer.phone}
                      </Typography>
                      {selectedConsumer.phone_verified ? (
                        <Chip label="Verified" color="success" size="small" />
                      ) : (
                        <Chip label="Unverified" color="error" size="small" />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Account Status */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Account Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Status
                    </Typography>
                    <Chip label={selectedConsumer.status} color={getStatusColor(selectedConsumer.status)} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Member Since
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(selectedConsumer.createdAt).toLocaleDateString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Addresses */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  📍 Addresses ({selectedConsumer.addresses?.length || 0})
                </Typography>
                {selectedConsumer.addresses?.length > 0 ? (
                  selectedConsumer.addresses.map((addr, idx) => (
                    <Paper key={idx} sx={{ p: 2, mb: 2, background: '#f9f9f9' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {addr.label} {addr.is_default && <Chip label="Default" size="small" />}
                      </Typography>
                      <Typography variant="body2">{addr.line1}</Typography>
                      {addr.line2 && <Typography variant="body2">{addr.line2}</Typography>}
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No addresses found for this consumer.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Shopping Cart */}
              {selectedConsumer.cart && selectedConsumer.cart.store_id && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🛒 Current Cart
                  </Typography>
                  <Paper sx={{ p: 2, background: '#FFF3E0' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Store
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedConsumer.cart.store_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Items in Cart
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedConsumer.cart.items}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Subtotal
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          ₹{selectedConsumer.cart.subtotal}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Total (with fees)
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2196F3' }}>
                          ₹{selectedConsumer.cart.total}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
            <Button onClick={handleCloseDetailDialog} sx={{ color: '#999' }}>
              Close
            </Button>
            <Button variant="contained" onClick={handleEditConsumer} sx={{ background: '#2196F3' }}>
              Edit Consumer
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add Consumer Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: '#4CAF50', color: 'white', fontWeight: 'bold' }}>
          ➕ Add New Consumer
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="consumer_name"
                value={formData.consumer_name}
                onChange={handleFormChange}
                placeholder="Enter consumer name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="Enter email address"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Enter phone number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    name="phone_verified"
                    checked={Boolean(formData.phone_verified)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone_verified: e.target.checked }))}
                  />
                  {' '} Phone Verified
                </label>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="OTP"
                name="otp"
                value={formData.otp || ''}
                onChange={handleFormChange}
                placeholder="Optional OTP"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="OTP Expiry"
                name="otp_expiry"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formData.otp_expiry || ''}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="FCM Token"
                name="fcm_token"
                value={formData.fcm_token || ''}
                onChange={handleFormChange}
                placeholder="Optional FCM token"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Addresses JSON"
                name="addresses_json"
                value={formData.addresses_json || '[]'}
                onChange={handleFormChange}
                helperText='Array format. Example: [{"label":"Home","line1":"Street","city":"City","state":"State","pincode":"123456"}]'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Cart JSON"
                name="cart_json"
                value={formData.cart_json || '{}'}
                onChange={handleFormChange}
                helperText='Object format. Example: {"store_name":"Store","items":[],"subtotal":0,"total":0}'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={handleCloseAddDialog} sx={{ color: '#999' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveConsumer} sx={{ background: '#4CAF50' }} disabled={loading}>
            Add Consumer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Consumer Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth sx={{ maxHeight: '90vh' }}>
        <DialogTitle sx={{ background: '#2196F3', color: 'white', fontWeight: 'bold' }}>
          ✏️ Edit Consumer Information - All Fields
        </DialogTitle>
        <DialogContent sx={{ mt: 2, maxHeight: 'calc(90vh - 140px)', overflow: 'auto' }}>
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1 }}>👤 Personal Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" name="consumer_name" value={formData.consumer_name} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Status" name="status" value={formData.status} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="FCM Token" name="fcm_token" value={formData.fcm_token} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    name="phone_verified"
                    checked={formData.phone_verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_verified: e.target.checked }))}
                  />
                  {' '} Phone Verified
                </label>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveConsumer} sx={{ background: '#2196F3' }} disabled={loading}>
            Update Consumer
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Consumer"
        description="This consumer account will be deleted. You have 10 seconds to undo this action."
        itemName={consumerToDelete?.consumer_name || 'Consumer'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
        timeout={10}
      />
    </Box>
  );
};

export default AllConsumers;
