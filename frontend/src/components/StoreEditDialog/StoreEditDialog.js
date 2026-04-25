import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';

const StoreEditDialog = ({ open, store, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    store_name: store?.store_name || '',
    description: store?.description || '',
    store_phone: store?.store_phone || '',
    store_email: store?.store_email || '',
    business_type: store?.business_type || '',
    min_order_amount: store?.min_order_amount || 0,
    delivery_fee: store?.delivery_fee || 0,
    delivery_radius_km: store?.delivery_radius_km || 5,
    is_delivery_available: store?.is_delivery_available || true,
    is_active: store?.is_active || true,
    categories: store?.categories || [],
    address: {
      shop_number: store?.address?.shop_number || '',
      building_name: store?.address?.building_name || '',
      street: store?.address?.street || '',
      city: store?.address?.city || '',
      state: store?.address?.state || '',
      zip_code: store?.address?.zip_code || '',
      landmark: store?.address?.landmark || ''
    },
    bank_details: {
      account_number: store?.bank_details?.account_number || '',
      ifsc_code: store?.bank_details?.ifsc_code || '',
      account_holder_name: store?.bank_details?.account_holder_name || ''
    }
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.store_name.trim()) newErrors.store_name = 'Store name is required';
    if (!formData.store_phone.trim()) newErrors.store_phone = 'Phone number is required';
    if (!formData.store_email.trim()) newErrors.store_email = 'Email is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving store:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!store) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Store: {store.store_name}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Store Name"
                value={formData.store_name}
                onChange={(e) => handleInputChange('store_name', e.target.value)}
                error={!!errors.store_name}
                helperText={errors.store_name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Type"
                value={formData.business_type}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Contact Information */}
          <Typography variant="h6" gutterBottom>Contact Information</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.store_phone}
                onChange={(e) => handleInputChange('store_phone', e.target.value)}
                error={!!errors.store_phone}
                helperText={errors.store_phone}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.store_email}
                onChange={(e) => handleInputChange('store_email', e.target.value)}
                error={!!errors.store_email}
                helperText={errors.store_email}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Address */}
          <Typography variant="h6" gutterBottom>Address</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shop Number"
                value={formData.address.shop_number}
                onChange={(e) => handleInputChange('address.shop_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Building Name"
                value={formData.address.building_name}
                onChange={(e) => handleInputChange('address.building_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                error={!!errors['address.city']}
                helperText={errors['address.city']}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                error={!!errors['address.state']}
                helperText={errors['address.state']}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.address.zip_code}
                onChange={(e) => handleInputChange('address.zip_code', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark"
                value={formData.address.landmark}
                onChange={(e) => handleInputChange('address.landmark', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Delivery Settings */}
          <Typography variant="h6" gutterBottom>Delivery Settings</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_delivery_available}
                    onChange={(e) => handleInputChange('is_delivery_available', e.target.checked)}
                  />
                }
                label="Delivery Available"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Order Amount (₹)"
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => handleInputChange('min_order_amount', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Delivery Fee (₹)"
                type="number"
                value={formData.delivery_fee}
                onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Delivery Radius (km)"
                type="number"
                value={formData.delivery_radius_km}
                onChange={(e) => handleInputChange('delivery_radius_km', parseFloat(e.target.value) || 0)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Store Status */}
          <Typography variant="h6" gutterBottom>Store Status</Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
              }
              label="Store Active"
            />
            {!formData.is_active && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Inactive stores will not be visible to customers
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          startIcon={<Save />}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreEditDialog;