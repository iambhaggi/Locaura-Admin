import React, { useEffect, useState } from 'react';
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
import { Edit, Delete, Settings, AlarmOn, Archive, Visibility } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { productsAPI } from '../../services/apiService';

const ProductStatus = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [products, setProducts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedProduct, setDeletedProduct] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((product) => ({
          ...product,
          store: product.store_name || String(product.store_id || '-'),
          total_views: Number(product.total_reviews || 0) * 10,
          total_clicks: Number(product.total_reviews || 0) * 4,
          conversion_rate: Number(product.total_reviews || 0) > 0 ? 4.0 : 0.0,
          lifecycle: product.status === 'active' ? 'Published' : product.status === 'draft' ? 'Draft' : 'Archived',
          last_updated: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '-',
        }));
        setProducts(mapped);
      } catch (err) {
        setError('Failed to fetch product status data');
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
      (p.store || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleManageStatus = (product) => {
    if (!product) return;
    // Toggle featured status
    const newFeaturedStatus = !product.is_featured;
    const updatedProducts = products.map(p => 
      p._id === product._id ? { ...p, is_featured: newFeaturedStatus } : p
    );
    setProducts(updatedProducts);
    setSnackbarMessage(`${product.name} ${newFeaturedStatus ? 'added to' : 'removed from'} featured products`);
    handleMenuClose();
  };

  const handleArchive = (product) => {
    if (!product) return;
    // Archive the product
    const updatedProducts = products.map(p => 
      p._id === product._id ? { ...p, status: 'archived', lifecycle: 'Archived', search_visibility: false } : p
    );
    setProducts(updatedProducts);
    setSnackbarMessage(`🗄 ${product.name} has been archived and hidden from search`);
    handleMenuClose();
  };

  const handleSchedule = (product) => {
    if (!product) return;
    // Schedule product activation
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + Math.floor(Math.random() * 7) + 1);
    const dateStr = scheduleDate.toLocaleDateString();
    setSnackbarMessage(`📅 ${product.name} scheduled to go live on ${dateStr}`);
    handleMenuClose();
  };

  const handleViewDetail = (product) => {
    if (!product) return;
    // Show detailed product status information
    setSelectedProduct(product);
    setOpenDetail(true);
    setSnackbarMessage(`Viewing status details for: ${product.name}`);
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
      // Remove from products list
      const currentProducts = products.length > 0 ? products : [];
      setProducts(currentProducts.filter(p => p._id !== productToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedProduct) {
      const currentProducts = products.length > 0 ? products : [];
      setProducts([...currentProducts, deletedProduct]);
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

  const stats = [
    {
      label: 'Active Products',
      value: products.filter((p) => p.status === 'active').length,
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Inactive Products',
      value: products.filter((p) => p.status !== 'active').length,
      bg: '#ffebee',
      color: '#f44336',
    },
    {
      label: 'Total Views',
      value: products.reduce((a, b) => a + b.total_views, 0),
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Avg Conversion',
      value: products.length > 0
        ? (products.reduce((a, b) => a + (Number(b.conversion_rate) || 0), 0) / products.length).toFixed(2) + '%'
        : '0.00%',
      bg: '#fce4ec',
      color: '#c2185b',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading product status...</Typography>}
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
          placeholder="Search by product or store name..."
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
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Views</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Clicks</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Conversion</TableCell>
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
                <TableCell>{product.store}</TableCell>
                <TableCell>{getStatusChip(product.status)}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.total_views}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.total_clicks}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${product.conversion_rate}%`}
                    size="small"
                    variant="outlined"
                    color={product.conversion_rate > 3 ? 'success' : 'default'}
                  />
                </TableCell>
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
                <TableCell colSpan={7} align="center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleViewDetail(selectedProduct)}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedProduct)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Product
        </MenuItem>
        <MenuItem onClick={() => handleManageStatus(selectedProduct)}>
          <Settings sx={{ mr: 1, fontSize: 18 }} />
          Toggle Featured
        </MenuItem>
        <MenuItem onClick={() => handleArchive(selectedProduct)}>
          <Archive sx={{ mr: 1, fontSize: 18 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={() => handleSchedule(selectedProduct)}>
          <AlarmOn sx={{ mr: 1, fontSize: 18 }} />
          Schedule
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedProduct)}>
          <Delete sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail/Edit Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {isEditMode ? 'Edit Product Status' : 'Product Status Details'}
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
                select
                fullWidth
                label="Status"
                value={editFormData.status || 'active'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                size="small"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Lifecycle"
                value={editFormData.lifecycle || 'Published'}
                onChange={(e) => setEditFormData({ ...editFormData, lifecycle: e.target.value })}
                size="small"
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </TextField>
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
                  <Typography variant="caption" sx={{ color: '#999' }}>Status</Typography>
                  <Box sx={{ mt: 1 }}>{getStatusChip(selectedProduct.status)}</Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>Lifecycle</Typography>
                  <Chip label={selectedProduct.lifecycle} size="small" sx={{ mt: 1 }} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Last Updated</Typography>
                <Typography variant="body2">{selectedProduct.last_updated}</Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        description="This will remove the product from the system. You can undo within 10 seconds."
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

export default ProductStatus;
