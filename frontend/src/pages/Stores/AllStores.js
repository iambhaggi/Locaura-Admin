import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
} from '@mui/material';

import {
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { storesAPI } from '../../services/apiService';

const AllStores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await storesAPI.getAll({ limit: 1000 });
        // API returns { success, data, pagination }
        setStores(response.data?.data || response.data || []);
      } catch (err) {
        setError('Failed to fetch stores');
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuStoreId, setMenuStoreId] = useState(null);
  const [formData, setFormData] = useState({
    retailer_id: '',
    store_name: '',
    slug: '',
    description: '',
    business_type: '',
    logo_url: '',
    banner_url: '',
    store_phone: '',
    store_email: '',
    instagram: '',
    whatsapp: '',
    shop_number: '',
    building_name: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    landmark: '',
    gstin: '',
    fssai_license: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    categories: '',
    delivery_radius_km: '',
    min_order_amount: '',
    delivery_fee: '',
    is_delivery_available: false,
    is_active: false,
    status: 'active',
    location_json: '',
    store_images_json: '',
    business_hours_json: '',
  });

  const handleMenuClick = (event, storeId) => {
    setAnchorEl(event.currentTarget);
    setMenuStoreId(storeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuStoreId(null);
  };

  const handleViewDetails = (store) => {
    setSelectedStore(store);
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedStore(null);
  };

  const handleEditStore = () => {
    const storeToEdit = selectedStore || (menuStoreId && stores.find(s => s._id === menuStoreId));
    if (storeToEdit) {
      setFormData({
        retailer_id: storeToEdit.retailer_id || '',
        store_name: storeToEdit.store_name,
        slug: storeToEdit.slug,
        description: storeToEdit.description,
        business_type: storeToEdit.business_type,
        logo_url: storeToEdit.logo_url,
        banner_url: storeToEdit.banner_url,
        store_phone: storeToEdit.store_phone,
        store_email: storeToEdit.store_email,
        instagram: storeToEdit.social_links?.instagram || '',
        whatsapp: storeToEdit.social_links?.whatsapp || '',
        shop_number: storeToEdit.address?.shop_number || '',
        building_name: storeToEdit.address?.building_name || '',
        street: storeToEdit.address?.street || '',
        city: storeToEdit.address?.city || '',
        state: storeToEdit.address?.state || '',
        zip_code: storeToEdit.address?.zip_code || '',
        landmark: storeToEdit.address?.landmark || '',
        gstin: storeToEdit.gstin,
        fssai_license: storeToEdit.fssai_license,
        account_number: storeToEdit.bank_details?.account_number || '',
        ifsc_code: storeToEdit.bank_details?.ifsc_code || '',
        account_holder_name: storeToEdit.bank_details?.account_holder_name || '',
        categories: Array.isArray(storeToEdit.categories) ? storeToEdit.categories.join(', ') : '',
        delivery_radius_km: storeToEdit.delivery_radius_km,
        min_order_amount: storeToEdit.min_order_amount,
        delivery_fee: storeToEdit.delivery_fee,
        is_delivery_available: storeToEdit.is_delivery_available,
        is_active: storeToEdit.is_active,
        status: storeToEdit.status,
        location_json: storeToEdit.location ? JSON.stringify(storeToEdit.location, null, 2) : '',
        store_images_json: Array.isArray(storeToEdit.store_images) ? JSON.stringify(storeToEdit.store_images, null, 2) : '',
        business_hours_json: Array.isArray(storeToEdit.business_hours) ? JSON.stringify(storeToEdit.business_hours, null, 2) : '',
      });
      setSelectedStore(storeToEdit);
      setEditDialogOpen(true);
      handleMenuClose();
      handleCloseDetailDialog();
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStore = () => {
    setSelectedStore(null);
    setEditDialogOpen(true);
  };

  const handleSaveStore = async () => {
    if (!formData.retailer_id || !formData.store_name || !formData.store_phone || !formData.store_email || !formData.street || !formData.city || !formData.state || !formData.zip_code) {
      alert('Please fill all required fields including retailer_id and full address');
      return;
    }

    if (selectedStore) {
      let location = null;
      let store_images = [];
      let business_hours = [];

      if (formData.location_json) {
        try {
          location = JSON.parse(formData.location_json);
        } catch (e) {
          alert('Invalid JSON for location');
          return;
        }
      }

      if (formData.store_images_json) {
        try {
          store_images = JSON.parse(formData.store_images_json);
        } catch (e) {
          alert('Invalid JSON for store images');
          return;
        }
      }

      if (formData.business_hours_json) {
        try {
          business_hours = JSON.parse(formData.business_hours_json);
        } catch (e) {
          alert('Invalid JSON for business hours');
          return;
        }
      }

      const updatedStore = {
        ...selectedStore,
        store_name: formData.store_name,
        slug: formData.slug,
        description: formData.description,
        business_type: formData.business_type,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        store_phone: formData.store_phone,
        store_email: formData.store_email,
        social_links: {
          instagram: formData.instagram,
          whatsapp: formData.whatsapp,
        },
        address: {
          shop_number: formData.shop_number,
          building_name: formData.building_name,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          landmark: formData.landmark,
        },
        gstin: formData.gstin,
        fssai_license: formData.fssai_license,
        bank_details: {
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
          account_holder_name: formData.account_holder_name,
        },
        categories: formData.categories.split(',').map(cat => cat.trim()),
        delivery_radius_km: parseInt(formData.delivery_radius_km),
        min_order_amount: parseInt(formData.min_order_amount),
        delivery_fee: parseInt(formData.delivery_fee),
        is_delivery_available: formData.is_delivery_available,
        is_active: formData.is_active,
        status: formData.status,
        location,
        store_images,
        business_hours,
      };
      
      setStores(stores.map(store => 
        store._id === selectedStore._id ? updatedStore : store
      ));
      setSelectedStore(updatedStore);
      setEditDialogOpen(false);
      alert('Store updated successfully!');
    } else {
      try {
        setLoading(true);
        let location = null;
        let store_images = [];
        let business_hours = [];

        if (formData.location_json) {
          try {
            location = JSON.parse(formData.location_json);
          } catch (e) {
            alert('Invalid JSON for location');
            return;
          }
        }

        if (formData.store_images_json) {
          try {
            store_images = JSON.parse(formData.store_images_json);
          } catch (e) {
            alert('Invalid JSON for store images');
            return;
          }
        }

        if (formData.business_hours_json) {
          try {
            business_hours = JSON.parse(formData.business_hours_json);
          } catch (e) {
            alert('Invalid JSON for business hours');
            return;
          }
        }

        const response = await storesAPI.create({
          retailer_id: formData.retailer_id,
          store_name: formData.store_name,
          slug: formData.slug,
          description: formData.description,
          business_type: formData.business_type,
          logo_url: formData.logo_url,
          banner_url: formData.banner_url,
          store_phone: formData.store_phone,
          store_email: formData.store_email,
          instagram: formData.instagram,
          whatsapp: formData.whatsapp,
          shop_number: formData.shop_number,
          building_name: formData.building_name,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          landmark: formData.landmark,
          gstin: formData.gstin,
          fssai_license: formData.fssai_license,
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
          account_holder_name: formData.account_holder_name,
          categories: formData.categories,
          delivery_radius_km: parseInt(formData.delivery_radius_km || 0, 10),
          min_order_amount: parseInt(formData.min_order_amount || 0, 10),
          delivery_fee: parseInt(formData.delivery_fee || 0, 10),
          is_delivery_available: formData.is_delivery_available,
          is_active: formData.is_active,
          location,
          store_images,
          business_hours,
        });

        const createdStore = response.data?.data || response.data;
        setStores([createdStore, ...stores]);
        setEditDialogOpen(false);
        alert('Store added successfully!');
      } catch (saveError) {
        alert(saveError.message || 'Failed to add store');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setFormData({
      retailer_id: '',
      store_name: '',
      slug: '',
      description: '',
      business_type: '',
      logo_url: '',
      banner_url: '',
      store_phone: '',
      store_email: '',
      instagram: '',
      whatsapp: '',
      shop_number: '',
      building_name: '',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      landmark: '',
      gstin: '',
      fssai_license: '',
      account_number: '',
      ifsc_code: '',
      account_holder_name: '',
      categories: '',
      delivery_radius_km: '',
      min_order_amount: '',
      delivery_fee: '',
      is_delivery_available: false,
      is_active: false,
      status: 'active',
      location_json: '',
      store_images_json: '',
      business_hours_json: '',
    });
  };

  const handleViewPerformance = () => {
    if (menuStoreId) {
      const store = stores.find(s => s._id === menuStoreId);
      handleMenuClose();
      navigate('/stores/performance', { state: { store } });
    }
  };

  const handleViewAnalytics = () => {
    if (menuStoreId) {
      const store = stores.find(s => s._id === menuStoreId);
      handleMenuClose();
      navigate('/stores/performance', { state: { store, tab: 'analytics' } });
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      (store.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.store_phone || '').includes(searchTerm) ||
      (store.store_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && store.status === statusFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const stats = [
    {
      label: 'Total Stores',
      value: stores.length,
      color: '#3f51b5',
    },
    {
      label: 'Active Stores',
      value: stores.filter((s) => s.status === 'active').length,
      color: '#4caf50',
    },
    {
      label: 'Avg Rating',
      value: (stores.reduce((sum, s) => sum + s.rating, 0) / stores.length).toFixed(1),
      color: '#ff9800',
    },
    {
      label: 'Delivery Available',
      value: stores.filter((s) => s.is_delivery_available).length,
      color: '#2196f3',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {loading && <Typography>Loading stores...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          🏪 All Stores
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStore}>
          Add New Store
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: stat.color, fontWeight: 'bold' }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by store name, phone, email, or city..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Store Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Delivery</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStores.map((store) => (
              <TableRow key={store._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff7043' }}>
                      {store.store_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {store.store_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {store.business_type}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16, color: '#666' }} />
                    {store.address.city}, {store.address.state}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{store.store_phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{store.store_email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                    <Typography variant="body2">{store.rating}</Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      ({store.total_reviews})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={store.is_delivery_available ? 'Available' : 'Unavailable'}
                    size="small"
                    color={store.is_delivery_available ? 'success' : 'default'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                    size="small"
                    color={getStatusColor(store.status)}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, store._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const store = stores.find((s) => s._id === menuStoreId);
            handleViewDetails(store);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditStore}>Edit Store</MenuItem>
        <MenuItem onClick={handleViewPerformance}>View Performance</MenuItem>
        <MenuItem onClick={handleViewAnalytics}>View Analytics</MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Store Details</DialogTitle>
        <DialogContent dividers>
          {selectedStore && (
            <Box sx={{ pt: 2 }}>
              {/* Store Info Section */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🏪 Store Information
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Store Name
                  </Typography>
                  <Typography>{selectedStore.store_name}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Business Type
                  </Typography>
                  <Typography>{selectedStore.business_type}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Description
                  </Typography>
                  <Typography>{selectedStore.description}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Location */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                📍 Location
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Address
                  </Typography>
                  <Typography>
                    {selectedStore.address.shop_number} {selectedStore.address.building_name}, {selectedStore.address.street}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    City, State
                  </Typography>
                  <Typography>
                    {selectedStore.address.city}, {selectedStore.address.state} - {selectedStore.address.zip_code}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Coordinates
                  </Typography>
                  <Typography variant="caption">
                    {selectedStore.location.coordinates[1].toFixed(4)}, {selectedStore.location.coordinates[0].toFixed(4)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Delivery Info */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🚚 Delivery Information
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Delivery Available
                  </Typography>
                  <Chip
                    label={selectedStore.is_delivery_available ? 'Yes' : 'No'}
                    size="small"
                    color={selectedStore.is_delivery_available ? 'success' : 'default'}
                    variant="filled"
                  />
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Delivery Radius
                  </Typography>
                  <Typography>{selectedStore.delivery_radius_km} km</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Min Order Amount
                  </Typography>
                  <Typography>₹{selectedStore.min_order_amount}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Delivery Fee
                  </Typography>
                  <Typography>₹{selectedStore.delivery_fee}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Bank Details */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🏦 Bank Details
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Account Holder Name</Typography>
                  <Typography>{selectedStore.bank_details?.account_holder_name || '-'}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>Account Number</Typography>
                  <Typography>{selectedStore.bank_details?.account_number || '-'}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>IFSC Code</Typography>
                  <Typography>{selectedStore.bank_details?.ifsc_code || '-'}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Business Hours */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🕒 Business Hours
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                {(selectedStore.business_hours && selectedStore.business_hours.length > 0) ? (
                  selectedStore.business_hours.map((hour, idx) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#999' }}>{hour.day}</Typography>
                      <Typography>
                        {hour.is_closed ? 'Closed' : `${hour.open} - ${hour.close}`}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption">No business hours set</Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Status Management */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🔄 Status Management
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Chip
                  label={selectedStore.status?.charAt(0).toUpperCase() + selectedStore.status?.slice(1)}
                  color={selectedStore.status === 'active' ? 'success' : selectedStore.status === 'suspended' ? 'error' : 'default'}
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Performance */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                ⭐ Performance
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 18, color: '#ffc107' }} />
                    <Typography>{selectedStore.rating} / 5</Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Total Reviews
                  </Typography>
                  <Typography>{selectedStore.total_reviews}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              handleCloseDetailDialog();
              handleEditStore();
            }}
          >
            Edit Store
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Store Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth sx={{ maxHeight: '90vh' }}>
        <DialogTitle sx={{ background: '#2196F3', color: 'white', fontWeight: 'bold' }}>
          {selectedStore ? '✏️ Edit Store Information - All Fields' : '➕ Add New Store - All Fields'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, maxHeight: 'calc(90vh - 140px)', overflow: 'auto' }}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1 }}>📋 Basic Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Retailer ID" name="retailer_id" value={formData.retailer_id} onChange={handleFormChange} variant="outlined" size="small" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Store Name" name="store_name" value={formData.store_name} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Slug" name="slug" value={formData.slug} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Business Type" name="business_type" value={formData.business_type} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Status" name="status" value={formData.status} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleFormChange} variant="outlined" multiline rows={2} size="small" />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>📞 Contact Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="store_phone" value={formData.store_phone} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="store_email" type="email" value={formData.store_email} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Instagram" name="instagram" value={formData.instagram} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>📍 Address Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Shop Number" name="shop_number" value={formData.shop_number} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Building Name" name="building_name" value={formData.building_name} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Street" name="street" value={formData.street} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Zip Code" name="zip_code" value={formData.zip_code} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Landmark" name="landmark" value={formData.landmark} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>

            {/* URLs and Media */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>🖼️ URLs and Media</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Logo URL" name="logo_url" value={formData.logo_url} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Banner URL" name="banner_url" value={formData.banner_url} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>

            {/* Legal and Compliance */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>⚖️ Legal and Compliance</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GSTIN" name="gstin" value={formData.gstin} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="FSSAI License" name="fssai_license" value={formData.fssai_license} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>🏦 Bank Details</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Account Holder Name" name="account_holder_name" value={formData.account_holder_name} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Account Number" name="account_number" value={formData.account_number} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="IFSC Code" name="ifsc_code" value={formData.ifsc_code} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>

            {/* Business Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>🛒 Business Details</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Categories (comma separated)" name="categories" value={formData.categories} onChange={handleFormChange} variant="outlined" size="small" helperText="Enter categories separated by commas" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Delivery Radius (km)" name="delivery_radius_km" type="number" value={formData.delivery_radius_km} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Min Order Amount" name="min_order_amount" type="number" value={formData.min_order_amount} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Delivery Fee" name="delivery_fee" type="number" value={formData.delivery_fee} onChange={handleFormChange} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    name="is_delivery_available"
                    checked={formData.is_delivery_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_delivery_available: e.target.checked }))}
                  />
                  {' '} Delivery Available
                </label>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  {' '} Active
                </label>
              </Box>
            </Grid>

            {/* Advanced Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1, mt: 2 }}>🔧 Advanced Fields (JSON)</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location (JSON)"
                name="location_json"
                value={formData.location_json}
                onChange={handleFormChange}
                variant="outlined"
                size="small"
                multiline
                rows={3}
                helperText='Example: {"type": "Point", "coordinates": [longitude, latitude]}'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Store Images (JSON Array)"
                name="store_images_json"
                value={formData.store_images_json}
                onChange={handleFormChange}
                variant="outlined"
                size="small"
                multiline
                rows={3}
                helperText='Example: ["url1.jpg", "url2.jpg"]'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Hours (JSON Array)"
                name="business_hours_json"
                value={formData.business_hours_json}
                onChange={handleFormChange}
                variant="outlined"
                size="small"
                multiline
                rows={4}
                helperText='Example: [{"day": "Monday", "open": "09:00", "close": "18:00", "is_closed": false}]'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveStore} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllStores;
