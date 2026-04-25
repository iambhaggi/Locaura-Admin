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
import { Edit, Delete, Fullscreen, RateReview, SwapHoriz } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { productsAPI } from '../../services/apiService';

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedProduct, setDeletedProduct] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getAll({ limit: 1000 });
        setProducts(response?.data?.data || response?.data || []);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getStatusChip = (status) => {
    const statusColors = {
      active: { bg: '#4caf50', color: '#fff' },
      draft: { bg: '#ff9800', color: '#fff' },
      inactive: { bg: '#f44336', color: '#fff' },
    };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        style={statusColors[status] || statusColors.inactive}
        size="small"
      />
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.store_name || String(p.store_id || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setOpenDetail(true);
    setAnchorEl(null);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedProduct(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setEditFormData({ ...product });
    setIsEditMode(true);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    setSnackbarMessage(`✓ Product updated: ${editFormData.name}`);
    setIsEditMode(false);
    setOpenDetail(false);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleManageVariants = (product) => {
    if (!product) return;
    navigate('/products/variants', { state: { product } });
    handleMenuClose();
  };

  const handleViewReviews = (product) => {
    if (!product) return;
    navigate('/reviews/products', { state: { product } });
    handleMenuClose();
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialog(true);
    setIsDeleted(false);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setDeletedProduct(productToDelete);
      setIsDeleted(true);
      // Remove from product list
      setProducts(products.filter(p => p._id !== productToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedProduct) {
      setProducts([...products, deletedProduct]);
      setSnackbarMessage(`${deletedProduct.name} has been restored`);
      setDeleteDialog(false);
      setDeletedProduct(null);
      setProductToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setProductToDelete(null);
    }
  };

  // Stats Cards
  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Active Products',
      value: products.filter((p) => p.status === 'active').length,
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Draft Products',
      value: products.filter((p) => p.status === 'draft').length,
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'Avg Rating',
      value: products.length > 0
        ? (products.reduce((a, b) => a + (Number(b.rating) || 0), 0) / products.length).toFixed(1)
        : '0.0',
      bg: '#fce4ec',
      color: '#c2185b',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading products...</Typography>}
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
          placeholder="Search by product name, brand, or store..."
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
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>{product.store_name || String(product.store_id || '-')}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      ₹{product.base_price}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ textDecoration: 'line-through', color: '#999' }}
                    >
                      ₹{product.base_compare_at_price}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: product.total_stock > 100 ? '#4caf50' : '#ff9800',
                    }}
                  >
                    {product.total_stock} units
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {product.rating}⭐
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      ({product.total_reviews || 0})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{getStatusChip(product.status)}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedProduct(product);
                      handleMenuOpen(e);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No products found
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
            handleOpenDetail(selectedProduct);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedProduct)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Product
        </MenuItem>
        <MenuItem onClick={() => handleManageVariants(selectedProduct)}>
          <SwapHoriz sx={{ mr: 1, fontSize: 18 }} />
          Manage Variants
        </MenuItem>
        <MenuItem onClick={() => handleViewReviews(selectedProduct)}>
          <RateReview sx={{ mr: 1, fontSize: 18 }} />
          View Reviews
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedProduct)}>
          <Delete sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail/Edit Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {isEditMode ? 'Edit Product' : 'Product Details'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {isEditMode && editFormData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Brand"
                value={editFormData.brand || ''}
                onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Store"
                value={editFormData.store_name || ''}
                disabled
                size="small"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Selling Price"
                  type="number"
                  value={editFormData.base_price || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, base_price: Number(e.target.value) })}
                  size="small"
                />
                <TextField
                  label="Compare Price"
                  type="number"
                  value={editFormData.base_compare_at_price || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, base_compare_at_price: Number(e.target.value) })}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Total Stock"
                  type="number"
                  value={editFormData.total_stock || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, total_stock: Number(e.target.value) })}
                  size="small"
                />
                <TextField
                  select
                  label="Status"
                  value={editFormData.status || 'active'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  size="small"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Box>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                size="small"
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
          ) : selectedProduct ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Product Name</Typography>
                <Typography variant="h6">{selectedProduct.name}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Brand</Typography>
                  <Typography variant="body2">{selectedProduct.brand}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Store</Typography>
                  <Typography variant="body2">{selectedProduct.store_name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>₹{selectedProduct.base_price}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Compare</Typography>
                  <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>₹{selectedProduct.base_compare_at_price}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Status</Typography>
                {getStatusChip(selectedProduct.status)}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Description</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{selectedProduct.description}</Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        description="This will remove the product from the catalog. You can undo within 10 seconds."
        itemName={productToDelete?.name || 'Product'}
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

export default AllProducts;
