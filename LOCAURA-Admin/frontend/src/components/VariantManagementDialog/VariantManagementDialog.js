import React, { useState, useEffect } from 'react';
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
  IconButton,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Close,
  Add,
  Edit,
  Delete,
  MoreVert,
  Inventory,
  ColorLens,
  Straighten,
} from '@mui/icons-material';

const VariantManagementDialog = ({ open, product, onClose, onSave }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newVariant, setNewVariant] = useState({
    color: '',
    color_hex: '#000000',
    size: '',
    price: product?.base_price || 0,
    compare_at_price: product?.base_compare_at_price || 0,
    stock_quantity: 0,
    sku: '',
    weight_grams: 0,
  });

  useEffect(() => {
    if (open && product) {
      setLoading(true);
      setTimeout(() => {
        const sampleVariants = [
          {
            _id: '1',
            color: 'Red',
            color_hex: '#FF0000',
            size: 'M',
            price: product.base_price,
            compare_at_price: product.base_compare_at_price,
            stock_quantity: 25,
            reserved_quantity: 3,
            sku: `${product.name?.replace(/\s+/g, '-').toUpperCase()}-RED-M`,
            weight_grams: 200,
            is_active: true,
          },
          {
            _id: '2',
            color: 'Blue',
            color_hex: '#0000FF',
            size: 'L',
            price: product.base_price,
            compare_at_price: product.base_compare_at_price,
            stock_quantity: 18,
            reserved_quantity: 2,
            sku: `${product.name?.replace(/\s+/g, '-').toUpperCase()}-BLUE-L`,
            weight_grams: 220,
            is_active: true,
          },
        ];
        setVariants(sampleVariants);
        setLoading(false);
      }, 1000);
    }
  }, [open, product]);

  const handleMenuOpen = (event, variant) => {
    setAnchorEl(event.currentTarget);
    setSelectedVariant(variant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVariant(null);
  };

  const handleEditVariant = () => {
    setEditingVariant(selectedVariant);
    setNewVariant({
      color: selectedVariant.color,
      color_hex: selectedVariant.color_hex,
      size: selectedVariant.size,
      price: selectedVariant.price,
      compare_at_price: selectedVariant.compare_at_price,
      stock_quantity: selectedVariant.stock_quantity,
      sku: selectedVariant.sku,
      weight_grams: selectedVariant.weight_grams,
    });
    setShowAddForm(true);
    handleMenuClose();
  };

  const handleDeleteVariant = () => {
    setVariants(prev => prev.filter(v => v._id !== selectedVariant._id));
    handleMenuClose();
  };

  const handleAddVariant = () => {
    if (editingVariant) {
      setVariants(prev => prev.map(v => 
        v._id === editingVariant._id 
          ? { ...v, ...newVariant, variant_label: `${newVariant.color} / ${newVariant.size}` }
          : v
      ));
    } else {
      const variant = {
        _id: Date.now().toString(),
        ...newVariant,
        variant_label: `${newVariant.color} / ${newVariant.size}`,
        reserved_quantity: 0,
        is_active: true,
      };
      setVariants(prev => [...prev, variant]);
    }
    
    setShowAddForm(false);
    setEditingVariant(null);
    setNewVariant({
      color: '',
      color_hex: '#000000',
      size: '',
      price: product?.base_price || 0,
      compare_at_price: product?.base_compare_at_price || 0,
      stock_quantity: 0,
      sku: '',
      weight_grams: 0,
    });
  };

  const handleStockUpdate = (variantId, newStock) => {
    setVariants(prev => prev.map(v => 
      v._id === variantId ? { ...v, stock_quantity: newStock } : v
    ));
  };

  const getStockStatus = (quantity, reserved) => {
    const available = quantity - reserved;
    if (available <= 0) return { text: 'Out of Stock', color: 'error' };
    if (available <= 5) return { text: 'Low Stock', color: 'warning' };
    return { text: 'In Stock', color: 'success' };
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  const totalValue = variants.reduce((sum, v) => sum + (v.stock_quantity * v.price), 0);

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Manage Variants: {product.name}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Inventory sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2">Total Variants</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {variants.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Inventory sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2">Total Stock</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {totalStock}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ColorLens sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="subtitle2">Colors</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {new Set(variants.map(v => v.color)).size}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Straighten sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="subtitle2">Stock Value</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    ₹{totalValue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {showAddForm && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Color"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Size"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Price (₹)"
                      type="number"
                      value={newVariant.price}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      type="number"
                      value={newVariant.stock_quantity}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                      <Button variant="contained" onClick={handleAddVariant}>
                        {editingVariant ? 'Update' : 'Add'}
                      </Button>
                      <Button onClick={() => {
                        setShowAddForm(false);
                        setEditingVariant(null);
                      }}>
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Variant</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((variant) => {
                  const stockStatus = getStockStatus(variant.stock_quantity, variant.reserved_quantity);
                  return (
                    <TableRow key={variant._id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {variant.variant_label || `${variant.color} / ${variant.size}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: variant.color_hex,
                              borderRadius: '50%',
                              border: '1px solid #ddd',
                            }}
                          />
                          {variant.color}
                        </Box>
                      </TableCell>
                      <TableCell>{variant.size}</TableCell>
                      <TableCell>₹{variant.price}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={variant.stock_quantity}
                          onChange={(e) => handleStockUpdate(variant._id, parseInt(e.target.value) || 0)}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.text}
                          color={stockStatus.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, variant)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {variants.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No variants found
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setShowAddForm(true)}>
                Add First Variant
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {!showAddForm && (
          <Fab
            color="primary"
            size="small"
            onClick={() => setShowAddForm(true)}
            sx={{ mr: 1 }}
          >
            <Add />
          </Fab>
        )}
        <Button variant="contained" onClick={() => onSave(variants)}>
          Save All Changes
        </Button>
      </DialogActions>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditVariant}>
          <Edit sx={{ mr: 1 }} />
          Edit Variant
        </MenuItem>
        <MenuItem onClick={handleDeleteVariant}>
          <Delete sx={{ mr: 1, color: 'error.main' }} />
          Delete Variant
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default VariantManagementDialog;