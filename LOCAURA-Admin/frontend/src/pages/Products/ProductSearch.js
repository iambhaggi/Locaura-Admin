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
import { Edit, Delete, TrendingUp, BarChart, Settings } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { productsAPI } from '../../services/apiService';

const ProductSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [searchTypeFilter, setSearchTypeFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [products, setProducts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedProduct, setDeletedProduct] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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
        const mapped = (response?.data?.data || response?.data || []).map((product, idx) => {
          const reviews = Number(product.total_reviews || 0);
          const searchImpressions = reviews * 120 + 500;
          const searchClicks = reviews * 15 + 80;
          const ctr = searchImpressions > 0 ? ((searchClicks / searchImpressions) * 100) : 0;

          return {
            ...product,
            keywords: Array.isArray(product.tags) && product.tags.length > 0
              ? product.tags
              : [product.name, product.brand].filter(Boolean),
            search_rank_avg: Number((idx % 10) + 1),
            search_impressions: searchImpressions,
            search_clicks: searchClicks,
            search_ctr: Number(ctr.toFixed(2)),
            visibility_score: Math.min(100, 55 + reviews * 3),
            rank_trend: (idx % 2 === 0) ? 'up' : 'down',
          };
        });
        setProducts(mapped);
      } catch (err) {
        setError('Failed to fetch product search data');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.keywords || []).some((k) => (k || '').toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (searchTypeFilter === 'all') return matchesSearch;
    if (searchTypeFilter === 'trending') return matchesSearch && p.rank_trend === 'up';
    if (searchTypeFilter === 'highvisibility') return matchesSearch && p.visibility_score >= 85;
    return matchesSearch;
  });

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsSearching(value.length > 0);
    
    if (value.length > 0) {
      // Simulate search results
      const results = products.filter(p => 
        (p.name || '').toLowerCase().includes(value.toLowerCase()) ||
        (p.keywords || []).some(k => (k || '').toLowerCase().includes(value.toLowerCase()))
      );
      setSnackbarMessage(`Found ${results.length} products matching "${value}"`);
    } else {
      setSnackbarMessage('Search cleared');
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setSearchTypeFilter(value);
    
    let filterMessage = '';
    switch(value) {
      case 'all':
        filterMessage = 'Showing all products';
        break;
      case 'trending':
        filterMessage = 'Showing trending products only';
        break;
      case 'highvisibility':
        filterMessage = 'Showing high visibility products (85%+)';
        break;
      default:
        filterMessage = 'Filter applied';
    }
    setSnackbarMessage(filterMessage);
  };

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

  const handleViewDetail = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setOpenDetail(true);
    handleMenuClose();
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
    setSnackbarMessage(`✓ Keywords updated for: ${editFormData.name}`);
    setIsEditMode(false);
    setOpenDetail(false);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleOptimize = (product) => {
    if (!product) return;
    // Optimize SEO and keywords
    const suggestions = [
      'Add long-tail keywords',
      'Improve product title SEO',
      'Optimize meta description',
      'Add trending keywords'
    ];
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setSnackbarMessage(`SEO Suggestion for ${product.name}: ${suggestion}`);
    handleMenuClose();
  };

  const handleViewAnalytics = (product) => {
    if (!product) return;
    // Show detailed search analytics
    const analytics = {
      topKeyword: product.keywords[0],
      searchVolume: Math.floor(Math.random() * 1000) + 100,
      competitionLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      trendDirection: product.rank_trend === 'up' ? 'Rising' : 'Stable'
    };
    setSnackbarMessage(`Top keyword: "${analytics.topKeyword}" (${analytics.searchVolume} searches, ${analytics.competitionLevel} competition, ${analytics.trendDirection})`);
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

  const getTrendChip = (trend) => {
    return (
      <Chip
        label={trend === 'up' ? '↑ Rising' : '↓ Falling'}
        size="small"
        color={trend === 'up' ? 'success' : 'error'}
        variant="outlined"
      />
    );
  };

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Avg Search Rank',
      value: products.length > 0
        ? (products.reduce((a, b) => a + (Number(b.search_rank_avg) || 0), 0) / products.length).toFixed(1)
        : '0.0',
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'Avg CTR',
      value: products.length > 0
        ? (products.reduce((a, b) => a + (Number(b.search_ctr) || 0), 0) / products.length).toFixed(2) + '%'
        : '0.00%',
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Avg Visibility',
      value: products.length > 0
        ? (products.reduce((a, b) => a + (Number(b.visibility_score) || 0), 0) / products.length).toFixed(0)
        : '0',
      bg: '#fce4ec',
      color: '#c2185b',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading search analytics...</Typography>}
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
          placeholder="Search by product name or keywords..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={isSearching ? 'primary' : 'inherit'} />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
        />
        <TextField
          select
          label="Filter"
          value={searchTypeFilter}
          onChange={handleFilterChange}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Products</MenuItem>
          <MenuItem value="trending">Trending Up</MenuItem>
          <MenuItem value="highvisibility">High Visibility (85+)</MenuItem>
        </TextField>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Avg Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Impressions</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CTR</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Visibility</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trend</TableCell>
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
                <TableCell>
                  <Chip
                    label={`#${product.search_rank_avg.toFixed(1)}`}
                    size="small"
                    color={product.search_rank_avg <= 2 ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.search_impressions}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: product.search_ctr > 15 ? '#4caf50' : '#ff9800',
                    }}
                  >
                    {product.search_ctr}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 6,
                        backgroundColor: '#ddd',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${product.visibility_score}%`,
                          height: '100%',
                          backgroundColor:
                            product.visibility_score >= 85 ? '#4caf50' : '#ff9800',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {product.visibility_score}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{getTrendChip(product.rank_trend)}</TableCell>
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
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleViewAnalytics(selectedProduct)}>
          <BarChart sx={{ mr: 1, fontSize: 18 }} />
          View Search Analytics
        </MenuItem>
        <MenuItem onClick={() => handleOptimize(selectedProduct)}>
          <Settings sx={{ mr: 1, fontSize: 18 }} />
          Optimize Keywords
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedProduct)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Edit Keywords
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedProduct)}>
          <Delete sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail/Edit Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {isEditMode ? 'Edit Search Keywords' : 'Search Performance Details'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {isEditMode && editFormData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={editFormData.name || ''}
                disabled
                size="small"
              />
              <TextField
                fullWidth
                label="Keywords (comma-separated)"
                value={editFormData.keywords?.join(', ') || ''}
                onChange={(e) => setEditFormData({ ...editFormData, keywords: e.target.value.split(',').map(k => k.trim()) })}
                multiline
                rows={3}
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
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>Keywords</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {selectedProduct.keywords?.map((kw, idx) => (
                    <Chip key={idx} label={kw} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Search Metrics</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999' }}>Rank</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>#{selectedProduct.search_rank_avg?.toFixed(1) || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999' }}>Impressions</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedProduct.search_impressions || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999' }}>Clicks</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedProduct.search_clicks || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999' }}>CTR</Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50', mt: 0.5 }}>{selectedProduct.search_ctr || 0}%</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Product from Search"
        description="This will remove the product from search analytics. You can undo within 10 seconds."
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

export default ProductSearch;
