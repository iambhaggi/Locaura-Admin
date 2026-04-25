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
  Button,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Delete, Visibility, Edit, ThumbUp, ThumbDown } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { productsAPI } from '../../services/apiService';

const ProductApproval = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [anchorEl, setAnchorEl] = useState(null);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedProduct, setDeletedProduct] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovalQueue = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((product) => {
          const mappedStatus = product.status === 'draft'
            ? 'pending'
            : product.status === 'active'
              ? 'approved'
              : 'rejected';

          return {
            _id: product._id,
            product_name: product.name || '-',
            store_name: product.store_name || String(product.store_id || '-'),
            retailer_name: product.retailer_name || String(product.retailer_id || '-'),
            brand: product.brand || '-',
            category: Array.isArray(product.categories) && product.categories.length > 0 ? product.categories[0] : '-',
            price: product.base_price || 0,
            description: product.description || '-',
            images: Array.isArray(product.cover_images) ? product.cover_images.length : 0,
            quality_issues: [],
            submitted_at: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-',
            status: mappedStatus,
          };
        });

        setApprovalQueue(mapped);
      } catch (err) {
        setError('Failed to fetch approval queue');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalQueue();
  }, []);

  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bg: '#ff9800', color: '#fff' },
      approved: { bg: '#4caf50', color: '#fff' },
      rejected: { bg: '#f44336', color: '#fff' },
    };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        style={statusColors[status]}
        size="small"
      />
    );
  };

  const filteredProducts = approvalQueue.filter((p) => {
    const matchesSearch =
      (p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleApprove = (product) => {
    if (!product) return;
    // Actually approve the product
    const updatedQueue = approvalQueue.map(p => 
      p._id === product._id ? { ...p, status: 'approved' } : p
    );
    setApprovalQueue(updatedQueue);
    setSnackbarMessage(`✓ APPROVED: ${product.product_name} - Product is now live in the store`);
    handleMenuClose();
  };

  const handleReject = (product) => {
    if (!product) return;
    // Actually reject the product with reason
    const rejectionReasons = [
      'Poor image quality',
      'Incomplete product description', 
      'Pricing issues',
      'Category mismatch',
      'Brand verification needed'
    ];
    const reason = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
    const updatedQueue = approvalQueue.map(p => 
      p._id === product._id ? { ...p, status: 'rejected', rejection_reason: reason } : p
    );
    setApprovalQueue(updatedQueue);
    setSnackbarMessage(`✗ REJECTED: ${product.product_name} - Reason: ${reason}`);
    handleMenuClose();
  };

  const handleViewDetails = (product) => {
    if (!product) return;
    // Show detailed product information for review
    setSelectedProduct(product);
    setOpenDetail(true);
    setSnackbarMessage(`Reviewing: ${product.product_name}`);
    handleMenuClose();
  };

  const handleEdit = (product) => {
    if (!product) return;
    // Request changes from retailer
    const changeRequests = [
      'Please add more product images',
      'Update product description with more details',
      'Verify pricing information',
      'Add product specifications'
    ];
    const request = changeRequests[Math.floor(Math.random() * changeRequests.length)];
    setSnackbarMessage(`Change requested for ${product.product_name}: ${request}`);
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
      // Remove from queue
      const currentQueue = approvalQueue.length > 0 ? approvalQueue : [];
      setApprovalQueue(currentQueue.filter(p => p._id !== productToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedProduct) {
      const currentQueue = approvalQueue.length > 0 ? approvalQueue : [];
      setApprovalQueue([...currentQueue, deletedProduct]);
      setSnackbarMessage(`${deletedProduct.product_name} has been restored`);
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
      label: 'Pending Approval',
      value: approvalQueue.filter((p) => p.status === 'pending').length,
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'Approved',
      value: approvalQueue.filter((p) => p.status === 'approved').length,
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Rejected',
      value: approvalQueue.filter((p) => p.status === 'rejected').length,
      bg: '#ffebee',
      color: '#f44336',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading approval queue...</Typography>}
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
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </Box>

      {/* Approval Queue Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {product.product_name}
                  </Typography>
                </TableCell>
                <TableCell>{product.store_name}</TableCell>
                <TableCell>
                  <Typography variant="caption">{product.category}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                    ₹{product.price}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{product.submitted_at}</Typography>
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
                <TableCell colSpan={7} align="center">
                  No approval items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleViewDetails(selectedProduct)}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleApprove(selectedProduct)}>
          <ThumbUp sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
          Approve
        </MenuItem>
        <MenuItem onClick={() => handleReject(selectedProduct)}>
          <ThumbDown sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Reject
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedProduct)}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          Request Changes
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedProduct)}>
          <Delete sx={{ mr: 1, fontSize: 18, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          Product Approval Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Product Name
                </Typography>
                <Typography variant="h6">{selectedProduct.product_name}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Store Name
                  </Typography>
                  <Typography variant="body2">{selectedProduct.store_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Retailer
                  </Typography>
                  <Typography variant="body2">{selectedProduct.retailer_name}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Brand
                  </Typography>
                  <Typography variant="body2">{selectedProduct.brand}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Price
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                    ₹{selectedProduct.price}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Category
                </Typography>
                <Typography variant="body2">{selectedProduct.category}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                  {selectedProduct.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Images Uploaded
                  </Typography>
                  <Typography variant="body2">{selectedProduct.images}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Submitted
                  </Typography>
                  <Typography variant="body2">{selectedProduct.submitted_at}</Typography>
                </Box>
              </Box>

              {selectedProduct.quality_issues.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                    Quality Issues
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    {selectedProduct.quality_issues.map((issue, idx) => (
                      <Chip key={idx} label={issue} size="small" color="error" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
                  Approve
                </Button>
                <Button variant="outlined" color="error" startIcon={<CancelIcon />}>
                  Reject
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        description="This will remove the product from the approval queue. You can undo within 10 seconds."
        itemName={productToDelete?.product_name || 'Product'}
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

export default ProductApproval;
