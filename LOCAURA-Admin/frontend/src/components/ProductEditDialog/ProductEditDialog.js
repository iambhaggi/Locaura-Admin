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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import { Close, Save, Cancel, Add, Delete } from '@mui/icons-material';

const ProductEditDialog = ({ open, product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    categories: product?.categories || [],
    base_price: product?.base_price || 0,
    base_compare_at_price: product?.base_compare_at_price || 0,
    total_stock: product?.total_stock || 0,
    status: product?.status || 'draft',
    is_featured: product?.is_featured || false,
    gender: product?.gender || 'unisex',
    tags: product?.tags || [],
    product_attributes: product?.product_attributes || [],
    cover_images: product?.cover_images || [],
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });

  const categoryOptions = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Kitchen', 
    'Health & Beauty', 'Sports', 'Books', 'Toys', 'Automotive'
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setFormData(prev => ({
        ...prev,
        product_attributes: [...prev.product_attributes, { ...newAttribute }]
      }));
      setNewAttribute({ name: '', value: '' });
    }
  };

  const handleRemoveAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      product_attributes: prev.product_attributes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.base_price <= 0) newErrors.base_price = 'Price must be greater than 0';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Product: {product.name}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Categories */}
          <Typography variant="h6" gutterBottom>Categories</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={categoryOptions}
                value={formData.categories}
                onChange={(event, newValue) => handleInputChange('categories', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categories"
                    placeholder="Select categories"
                    error={!!errors.categories}
                    helperText={errors.categories}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Pricing & Stock */}
          <Typography variant="h6" gutterBottom>Pricing & Stock</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Selling Price (₹)"
                type="number"
                value={formData.base_price}
                onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
                error={!!errors.base_price}
                helperText={errors.base_price}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Compare At Price (₹)"
                type="number"
                value={formData.base_compare_at_price}
                onChange={(e) => handleInputChange('base_compare_at_price', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.total_stock}
                onChange={(e) => handleInputChange('total_stock', parseInt(e.target.value) || 0)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Tags */}
          <Typography variant="h6" gutterBottom>Tags</Typography>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button variant="outlined" onClick={handleAddTag} startIcon={<Add />}>
                Add
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Product Attributes */}
          <Typography variant="h6" gutterBottom>Product Attributes</Typography>
          <Box sx={{ mb: 3 }}>
            {formData.product_attributes.map((attr, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={`${attr.name}: ${attr.value}`} />
                <IconButton size="small" onClick={() => handleRemoveAttribute(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={5}>
                <TextField
                  size="small"
                  fullWidth
                  label="Attribute Name"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  size="small"
                  fullWidth
                  label="Attribute Value"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                />
              </Grid>
              <Grid item xs={2}>
                <Button variant="outlined" onClick={handleAddAttribute} startIcon={<Add />}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Settings */}
          <Typography variant="h6" gutterBottom>Settings</Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                />
              }
              label="Featured Product"
            />
            {formData.is_featured && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Featured products will be highlighted in the store
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

export default ProductEditDialog;