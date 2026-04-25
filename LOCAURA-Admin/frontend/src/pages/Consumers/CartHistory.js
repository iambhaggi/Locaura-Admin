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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
  Alert,
  Tab,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  MoreVert,
  Search,
  Delete,
  Edit,
  Visibility,
  ShoppingCart,
  Close,
  GetApp,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { consumersAPI } from '../../services/apiService';

const sampleCarts = [];

const CartHistory = () => {
  const [carts, setCarts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCart, setSelectedCart] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(false);
  const [tabValue, setTabValue] = useState('overview');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [cartToDelete, setCartToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedCart, setDeletedCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter carts
  const filteredCarts = carts.filter((cart) => {
    const name = cart.consumer_name || '';
    const email = cart.consumer_email || '';
    const store = cart.store_name || '';

    const matchesSearch =
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      store.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || cart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleActionClick = (event, cart) => {
    setAnchorEl(event.currentTarget);
    setSelectedCart(cart);
    setOpenActionMenu(true);
  };

  const handleCloseActionMenu = () => {
    setOpenActionMenu(false);
    setAnchorEl(null);
  };

  const handleViewDetails = (cart) => {
    setSelectedCart(cart);
    setOpenDetailDialog(true);
    setTabValue('overview');
    handleCloseActionMenu();
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedCart(null);
  };

  const fetchCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await consumersAPI.getAll({ limit: 1000 });
      const consumers = response.data?.data || response.data || response || [];
      const cartsData = Array.isArray(consumers)
        ? consumers.map((consumer) => ({
            _id: consumer._id,
            consumer_id: consumer._id,
            consumer_name: consumer.consumer_name || 'Unknown',
            consumer_email: consumer.email || '',
            consumer_phone: consumer.phone || '',
            store_id: consumer.cart?.store_id || null,
            store_name: consumer.cart?.store_name || 'N/A',
            items: consumer.cart?.items || [],
            subtotal: consumer.cart?.subtotal || 0,
            platform_fee: consumer.cart?.platform_fee || 0,
            delivery_fee: consumer.cart?.delivery_fee || 0,
            total: consumer.cart?.total || 0,
            createdAt: consumer.createdAt,
            updatedAt: consumer.updatedAt,
            status:
              consumer.cart?.items?.length > 0
                ? 'active'
                : 'empty',
          }))
        : [];
      setCarts(cartsData.filter((cart) => cart.items.length > 0));
    } catch (err) {
      console.error('Error fetching cart history:', err);
      setError('Unable to load cart history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleDelete = (cart) => {
    setTimeout(() => {
      setCartToDelete(cart);
      setDeleteDialog(true);
      setIsDeleted(false);
    }, 100);
  };

  const handleConfirmDelete = () => {
    if (cartToDelete) {
      setDeletedCart(cartToDelete);
      setIsDeleted(true);
      setCarts(carts.filter(c => c._id !== cartToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedCart) {
      setCarts([...carts, deletedCart]);
      setDeleteDialog(false);
      setDeletedCart(null);
      setCartToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setCartToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'abandoned':
        return 'warning';
      case 'converted':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            🛒 Cart History
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            View and manage consumer shopping carts
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E3F2FD' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              {carts.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1976D2' }}>
              Total Carts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#C8E6C9' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {carts.filter((c) => c.status === 'active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#388E3C' }}>
              Active Carts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#FFE0B2' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              {carts.filter((c) => c.status === 'abandoned').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#E65100' }}>
              Abandoned Carts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#F3E5F5' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
              ₹{carts.reduce((sum, c) => sum + c.total, 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#7B1FA2' }}>
              Total Value
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search by consumer name, email, or store..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ background: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ background: '#f5f5f5' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="abandoned">Abandoned</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Subtotal</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Updated</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCarts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Alert severity="info">No carts found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredCarts.map((cart) => (
                <TableRow key={cart._id} sx={{ '&:hover': { background: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, background: '#2196F3' }}>
                        {cart.consumer_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cart.consumer_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {cart.consumer_email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cart.store_name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={cart.items.length} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{cart.subtotal}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                      ₹{cart.total}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={cart.status} color={getStatusColor(cart.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '12px', color: '#999' }}>
                      {new Date(cart.updatedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, cart)}
                      sx={{ color: '#2196F3' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={openActionMenu} onClose={handleCloseActionMenu}>
        <MenuItem onClick={() => handleViewDetails(selectedCart)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem>
          <GetApp sx={{ mr: 1 }} /> Export
        </MenuItem>
        <MenuItem onClick={() => { handleDelete(selectedCart); }} sx={{ color: '#d32f2f' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      {selectedCart && (
        <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ background: '#2196F3', color: 'white', fontWeight: 'bold' }}>
            🛒 Cart Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TabContext value={tabValue}>
              <TabList onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Overview" value="overview" />
                <Tab label="Cart Items" value="items" />
                <Tab label="Pricing" value="pricing" />
              </TabList>

              {/* Overview Tab */}
              <TabPanel value="overview">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Cart ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedCart._id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedCart.status}
                      color={getStatusColor(selectedCart.status)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Consumer
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedCart.consumer_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {selectedCart.consumer_email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Store
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedCart.store_name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Created
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(selectedCart.createdAt).toLocaleDateString('en-IN')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(selectedCart.updatedAt).toLocaleDateString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Items Tab */}
              <TabPanel value="items">
                {selectedCart.items.length === 0 ? (
                  <Alert severity="info">No items in this cart</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {selectedCart.items.map((item, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Paper sx={{ p: 2, background: '#f9f9f9' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={2}>
                              <Box
                                sx={{
                                  width: '100%',
                                  background: '#e0e0e0',
                                  height: 80,
                                  borderRadius: 1,
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={10}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {item.product_name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                by {item.brand_name}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Chip label={`SKU: ${item.variant_sku}`} size="small" />
                                <Chip label={item.variant_label} size="small" />
                              </Box>
                              <Box sx={{ mt: 1, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                                <Typography variant="body2">
                                  Qty: <strong>{item.quantity}</strong>
                                </Typography>
                                <Typography variant="body2">
                                  Price: <strong>₹{item.price}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                                  Total: ₹{item.quantity * item.price}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Pricing Tab */}
              <TabPanel value="pricing">
                <Paper sx={{ p: 2, background: '#f9f9f9' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Subtotal
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ₹{selectedCart.subtotal}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Platform Fee
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ₹{selectedCart.platform_fee}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Delivery Fee
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ₹{selectedCart.delivery_fee}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Discount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        -₹{selectedCart.discount}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Total Amount
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                          ₹{selectedCart.total}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </TabPanel>
            </TabContext>
          </DialogContent>
          <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
            <Button onClick={handleCloseDetailDialog} sx={{ color: '#999' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Cart"
        description="This cart will be deleted. You have 10 seconds to undo this action."
        itemName={cartToDelete?.consumer_name || 'Cart'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Box>
  );
};

export default CartHistory;
