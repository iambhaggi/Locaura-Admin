import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
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
} from '@mui/icons-material';
import { getAppCategories } from '../api/endpoints';
import CategoryProfile from '../components/CategoryProfile/CategoryProfile';

const AppCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [selectedCategoryProfile, setSelectedCategoryProfile] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        search: searchTerm || undefined,
      };
      const response = await getAppCategories(params);
      setCategories(response.data.categories || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleViewDetails = (category) => {
    setSelectedCategoryProfile(category);
    setProfileDialog(true);
    handleMenuClose();
  };

  const handleStatusChange = (categoryId, newStatus) => {
    setCategories(categories.map(category => 
      (category._id || category.id) === categoryId ? { ...category, status: newStatus } : category
    ));
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const displayCategories = categories;

  if (loading && categories.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          App Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchCategories}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Typography variant="body2" color="text.secondary">
              {categories.length} categories
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Products Count</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayCategories.map((category) => (
                  <TableRow key={category._id || category.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }} src={category.image}>
                          {category.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {category.name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{category.description || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={category.status || 'active'}
                        color={getStatusColor(category.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{category.productCount || 0}</TableCell>
                    <TableCell>
                      {category.parent_id ? category.parent_id.name || category.parent_id : 'Root'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, category)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {displayCategories.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                Showing sample category rows for visual reference
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedCategory)}>
          <CheckCircle sx={{ mr: 1, color: 'primary.main' }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedCategory?._id || selectedCategory?.id, 'active')}>
          <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
          Activate
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedCategory?._id || selectedCategory?.id, 'inactive')}>
          <Block sx={{ mr: 1, color: 'error.main' }} />
          Deactivate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Delete sx={{ mr: 1, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      <CategoryProfile 
        category={selectedCategoryProfile} 
        open={profileDialog} 
        onClose={() => setProfileDialog(false)} 
      />
    </Box>
  );
};

export default AppCategories;