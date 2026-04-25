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
  InputAdornment,
  MenuItem,
  Snackbar,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { Edit, Delete, Playlist, ShoppingCart, Add } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { categoriesAPI, productsAPI } from '../../services/apiService';

const ProductCategories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedCategory, setDeletedCategory] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          categoriesAPI.getAll({ limit: 1000 }),
          productsAPI.getAll({ limit: 1000 }),
        ]);

        const categoriesData = categoriesRes?.data?.data || categoriesRes?.data || [];
        const productsData = productsRes?.data?.data || productsRes?.data || [];

        const mapped = categoriesData.map((category) => {
          const productCount = productsData.filter((product) =>
            Array.isArray(product.categories) && product.categories.includes(category.name)
          ).length;

          return {
            ...category,
            product_count: productCount,
          };
        });

        setCategories(mapped);
      } catch (err) {
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetail = (category) => {
    setSelectedCategory(category);
    setOpenDetail(true);
    setAnchorEl(null);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedCategory(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (category) => {
    if (!category) return;
    setSelectedCategory(category);
    setEditFormData({ ...category, isNew: false });
    setIsEditMode(true);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleViewProducts = (category) => {
    if (!category) return;
    navigate('/products', { state: { category } });
    handleMenuClose();
  };

  const handleAddSubcategory = (category) => {
    if (!category) return;
    setSelectedCategory(category);
    setEditFormData({ name: '', description: '', parent_id: category._id, isNew: true });
    setIsEditMode(true);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    const action = editFormData.isNew ? 'added' : 'updated';
    setSnackbarMessage(`✓ Category ${action}: ${editFormData.name}`);
    setIsEditMode(false);
    setOpenDetail(false);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialog(true);
    setIsDeleted(false);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      setDeletedCategory(categoryToDelete);
      setIsDeleted(true);
      // Remove from categories list
      const currentCategories = categories.length > 0 ? categories : [];
      setCategories(currentCategories.filter(c => c._id !== categoryToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedCategory) {
      const currentCategories = categories.length > 0 ? categories : [];
      setCategories([...currentCategories, deletedCategory]);
      setSnackbarMessage(`${deletedCategory.name} has been restored`);
      setDeleteDialog(false);
      setDeletedCategory(null);
      setCategoryToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setCategoryToDelete(null);
    }
  };

  const stats = [
    {
      label: 'Total Categories',
      value: categories.length,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Total Products',
      value: categories.reduce((a, b) => a + (b.product_count || 0), 0),
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Avg Products/Category',
      value: categories.length > 0
        ? Math.round(categories.reduce((a, b) => a + (b.product_count || 0), 0) / categories.length)
        : 0,
      bg: '#fff3e0',
      color: '#ff9800',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading categories...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
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

      {/* Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by category name..."
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
      </Box>

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Products</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {category.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${category.product_count} items`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedCategory(category);
                      handleMenuOpen(e);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No categories found
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
            handleOpenDetail(selectedCategory);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedCategory)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Category
        </MenuItem>
        <MenuItem onClick={() => handleViewProducts(selectedCategory)}>
          <ShoppingCart sx={{ mr: 1, fontSize: 18 }} />
          View Products
        </MenuItem>
        <MenuItem onClick={() => handleAddSubcategory(selectedCategory)}>
          <Add sx={{ mr: 1, fontSize: 18 }} />
          Add Subcategory
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedCategory)}>
          <Delete sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail/Edit Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {isEditMode ? (editFormData?.isNew ? 'Add Category' : 'Edit Category') : 'Category Details'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {isEditMode && editFormData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Category Name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                size="small"
              />
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
          ) : selectedCategory ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Category Name</Typography>
                <Typography variant="h6">{selectedCategory.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Description</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{selectedCategory.description}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Products</Typography>
                <Typography variant="h6" sx={{ color: '#1976d2', mt: 1 }}>{selectedCategory.product_count}</Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Category"
        description="This will remove the category from the system. You can undo within 10 seconds."
        itemName={categoryToDelete?.name || 'Category'}
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

export default ProductCategories;
