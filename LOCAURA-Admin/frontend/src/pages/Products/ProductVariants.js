import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  MenuItem,
  InputAdornment,
  Snackbar,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { Edit, Delete, ShoppingCart, TrendingUp } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { productVariantsAPI, productsAPI } from '../../services/apiService';

const ProductVariants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [variants, setVariants] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedVariant, setDeletedVariant] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVariants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productVariantsAPI.getAll({ limit: 1000 });
        let variantRows = response?.data?.data || response?.data || [];

        // Fallback: if variant endpoint returns empty, attempt extracting child arrays from products.
        if (!Array.isArray(variantRows) || variantRows.length === 0) {
          const productsResponse = await productsAPI.getAll({ limit: 1000 });
          const parents = productsResponse?.data?.data || productsResponse?.data || [];
          variantRows = parents.flatMap((parent) => {
            if (!Array.isArray(parent.child_products)) return [];
            return parent.child_products.map((variant) => ({
              ...variant,
              parent_id: parent._id,
              parent_name: parent.name,
            }));
          });
        }

        const mapped = (variantRows || []).map((variant) => ({
          ...variant,
          parent_name: (typeof variant.parent_id === 'object' && variant.parent_id?.name)
            ? variant.parent_id.name
            : (variant.parent_name || '-'),
          color: variant.color || '-',
          color_hex: variant.color_hex || '#bdbdbd',
          size: variant.size || '-',
          length: variant.length || '-',
          barcode: variant.barcode || '-',
          reserved_quantity: Number(variant.reserved_quantity || 0),
          stock_quantity: Number(variant.stock_quantity || 0),
          price: Number(variant.price || 0),
          compare_at_price: Number(variant.compare_at_price || 0),
          cost_price: Number(variant.cost_price || 0),
          weight_grams: Number(variant.weight_grams || 0),
          length_cm: Number(variant.length_cm || 0),
          width_cm: Number(variant.width_cm || 0),
          height_cm: Number(variant.height_cm || 0),
          images_count: Array.isArray(variant.images) ? variant.images.length : 0,
          is_active: variant.is_active !== false,
          categories: Array.isArray(variant.categories) ? variant.categories : [],
          custom_variation_attributes: Array.isArray(variant.custom_variation_attributes)
            ? variant.custom_variation_attributes
            : [],
        }));
        setVariants(mapped);
      } catch (err) {
        setError('Failed to fetch child products. Ensure backend is restarted and /api/app/product-variants is available.');
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, []);

  const getStockStatus = (quantity, reserved) => {
    const available = quantity - reserved;
    if (available <= 0) return { text: 'Out of Stock', color: '#f44336' };
    if (available <= 10) return { text: 'Low Stock', color: '#ff9800' };
    return { text: 'In Stock', color: '#4caf50' };
  };

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      (v.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.variant_label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.color || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.parent_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.barcode || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stockFilter === 'all') return matchesSearch;
    if (stockFilter === 'instock') return matchesSearch && (v.stock_quantity - v.reserved_quantity) > 0;
    if (stockFilter === 'lowstock') return matchesSearch && (v.stock_quantity - v.reserved_quantity) > 0 && (v.stock_quantity - v.reserved_quantity) <= 10;
    if (stockFilter === 'outofstock') return matchesSearch && (v.stock_quantity - v.reserved_quantity) <= 0;
    return matchesSearch;
  });

  const handleOpenDetail = (variant) => {
    setSelectedVariant(variant);
    setOpenDetail(true);
    setAnchorEl(null);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedVariant(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (variant) => {
    if (!variant) return;
    setSelectedVariant(variant);
    setEditFormData({ ...variant });
    setIsEditMode(true);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleUpdateStocks = (variant) => {
    if (!variant) return;
    navigate('/products/inventory', { state: { variant } });
    handleMenuClose();
  };

  const handleViewSales = (variant) => {
    if (!variant) return;
    navigate('/products/trends', { state: { variant } });
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    setSnackbarMessage(`✓ Variant updated: ${editFormData.variant_label}`);
    setIsEditMode(false);
    setOpenDetail(false);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleDeleteClick = (variant) => {
    setVariantToDelete(variant);
    setDeleteDialog(true);
    setIsDeleted(false);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (variantToDelete) {
      setDeletedVariant(variantToDelete);
      setIsDeleted(true);
      // Local state removal
      const currentVariants = variants.length > 0 ? variants : [];
      setVariants(currentVariants.filter(v => v._id !== variantToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedVariant) {
      const currentVariants = variants.length > 0 ? variants : [];
      setVariants([...currentVariants, deletedVariant]);
      setSnackbarMessage(`${deletedVariant.variant_label} has been restored`);
      setDeleteDialog(false);
      setDeletedVariant(null);
      setVariantToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setVariantToDelete(null);
    }
  };

  const stats = [
    {
      label: 'Total Variants',
      value: variants.length,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'In Stock',
      value: variants.filter((v) => (v.stock_quantity - v.reserved_quantity) > 0).length,
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Low Stock',
      value: variants.filter((v) => (v.stock_quantity - v.reserved_quantity) > 0 && (v.stock_quantity - v.reserved_quantity) <= 10).length,
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'Total Stock Units',
      value: variants.reduce((a, b) => a + (b.stock_quantity - b.reserved_quantity), 0),
      bg: '#fce4ec',
      color: '#c2185b',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading product variants...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ backgroundColor: stat.bg, border: 'none' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h5" style={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by SKU, parent product, variant, color, or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
        />
        <TextField
          select
          label="Stock Status"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="instock">In Stock</MenuItem>
          <MenuItem value="lowstock">Low Stock</MenuItem>
          <MenuItem value="outofstock">Out of Stock</MenuItem>
        </TextField>
      </Box>

      {/* Variants Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Parent Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Variant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Size / Length</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reserved</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Barcode</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVariants.map((variant) => {
              const stockStatus = getStockStatus(variant.stock_quantity, variant.reserved_quantity);
              const availableStock = variant.stock_quantity - variant.reserved_quantity;
              return (
                <TableRow key={variant._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {variant.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>{variant.parent_name || '-'}</TableCell>
                  <TableCell>{variant.variant_label}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: variant.color_hex,
                          borderRadius: '50%',
                          border: '2px solid #ddd',
                        }}
                      />
                      {variant.color}
                    </Box>
                  </TableCell>
                  <TableCell>{variant.size} / {variant.length}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      ₹{variant.price}
                    </Typography>
                    {variant.compare_at_price > 0 && (
                      <Typography variant="caption" sx={{ color: '#999', textDecoration: 'line-through' }}>
                        ₹{variant.compare_at_price}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: availableStock > 10 ? '#4caf50' : '#ff9800',
                      }}
                    >
                      {availableStock}
                    </Typography>
                  </TableCell>
                  <TableCell>{variant.reserved_quantity}</TableCell>
                  <TableCell>{variant.barcode}</TableCell>
                  <TableCell>
                    <Chip
                      label={variant.is_active ? 'Yes' : 'No'}
                      size="small"
                      color={variant.is_active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={stockStatus.text}
                      size="small"
                      style={{ backgroundColor: stockStatus.color, color: '#fff' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setSelectedVariant(variant);
                        handleMenuOpen(e);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filteredVariants.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  No product variants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenDetail(selectedVariant);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedVariant)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Variant
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStocks(selectedVariant)}>
          <ShoppingCart sx={{ mr: 1, fontSize: 18 }} />
          Update Stock
        </MenuItem>
        <MenuItem onClick={() => handleViewSales(selectedVariant)}>
          <TrendingUp sx={{ mr: 1, fontSize: 18 }} />
          View Sales
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedVariant)}>
          <Delete sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail/Edit Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {isEditMode ? 'Edit Variant' : 'Variant Details'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {isEditMode && editFormData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="SKU"
                value={editFormData.sku || ''}
                onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Variant Label"
                value={editFormData.variant_label || ''}
                onChange={(e) => setEditFormData({ ...editFormData, variant_label: e.target.value })}
                size="small"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Color"
                  value={editFormData.color || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                  size="small"
                />
                <TextField
                  label="Size"
                  value={editFormData.size || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Selling Price"
                  type="number"
                  value={editFormData.price || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                  size="small"
                />
                <TextField
                  label="Cost Price"
                  type="number"
                  value={editFormData.cost_price || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, cost_price: Number(e.target.value) })}
                  size="small"
                />
              </Box>
              <TextField
                label="Stock Quantity"
                type="number"
                value={editFormData.stock_quantity || 0}
                onChange={(e) => setEditFormData({ ...editFormData, stock_quantity: Number(e.target.value) })}
                size="small"
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSaveEdit} fullWidth>
                  Save
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit} fullWidth>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : selectedVariant ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>SKU</Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{selectedVariant.sku}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Parent Product</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedVariant.parent_name || '-'}</Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>Color</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Box sx={{ width: 24, height: 24, backgroundColor: selectedVariant.color_hex, borderRadius: '50%', border: '2px solid #ddd' }} />
                    <Typography variant="body2">{selectedVariant.color}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Size</Typography>
                  <Typography variant="body2">{selectedVariant.size}</Typography>
                  <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>Length</Typography>
                  <Typography variant="body2">{selectedVariant.length}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>₹{selectedVariant.price}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Stock</Typography>
                  <Typography variant="body2">{selectedVariant.stock_quantity}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Barcode</Typography>
                  <Typography variant="body2">{selectedVariant.barcode || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Active</Typography>
                  <Typography variant="body2">{selectedVariant.is_active ? 'Yes' : 'No'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Weight (g)</Typography>
                  <Typography variant="body2">{selectedVariant.weight_grams || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Dimensions (L x W x H cm)</Typography>
                  <Typography variant="body2">
                    {selectedVariant.length_cm || 0} x {selectedVariant.width_cm || 0} x {selectedVariant.height_cm || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Images</Typography>
                  <Typography variant="body2">{selectedVariant.images_count || 0}</Typography>
                </Box>
              </Box>
              {selectedVariant.custom_variation_attributes?.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Custom Attributes</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {selectedVariant.custom_variation_attributes.map((attr, idx) => (
                      <Chip key={idx} size="small" label={`${attr.name}: ${attr.value}`} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Variant"
        description="This will remove the variant from inventory. You can undo within 10 seconds."
        itemName={variantToDelete?.variant_label || 'Variant'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ProductVariants;
