import React, { useEffect, useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel, LinearProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { ordersAPI } from '../../services/apiService';

const OrderItems = () => {
  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchOrderItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ limit: 1000 });
        // Flatten items from all orders
        const allItems = [];
        (response?.data?.data || response?.data || []).forEach(order => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item, index) => {
              allItems.push({
                id: `${order._id}_${index}`,
                orderId: order.order_number || order._id,
                product: item.name || item.product_name || 'Unknown Product',
                qty: item.quantity || 1,
                price: `₹${item.price || item.total_price || 0}`,
                status: order.status || 'unknown',
                order_date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
                consumer_email: order.consumer_email || String(order.consumer_id || '-'),
                store_name: order.store_name || String(order.store_id || '-'),
                item_details: item,
                order_details: order,
              });
            });
          }
        });
        setItemsData(allItems);
      } catch (err) {
        setError('Failed to fetch order items');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, []);

  const filteredItems = itemsData.filter((i) =>
    (i.product.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || i.status === statusFilter)
  );

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'out_for_delivery': return 'info';
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'placed': return 'warning';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Items', value: itemsData.length, color: '#1976d2' },
    { label: 'Delivered', value: itemsData.filter(i => ['delivered', 'completed'].includes((i.status || '').toLowerCase())).length, color: '#388e3c' },
    { label: 'In Transit', value: itemsData.filter(i => ['in_transit', 'out_for_delivery'].includes((i.status || '').toLowerCase())).length, color: '#f57c00' },
    { label: 'Cancelled', value: itemsData.filter(i => (i.status || '').toLowerCase() === 'cancelled').length, color: '#d32f2f' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}>
              <CardContent>
                <Typography color="textSecondary">{stat.label}</Typography>
                <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search by product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="placed">Placed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((i) => (
              <TableRow key={i.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{i.orderId}</TableCell>
                <TableCell>{i.product}</TableCell>
                <TableCell>{i.qty}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{i.price}</TableCell>
                <TableCell>
                  <Chip
                    label={i.status}
                    color={getStatusColor(i.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, i)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No items found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedItem)}>View Details</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Order Item Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedItem && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Order ID</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.orderId}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Product</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.product}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Quantity</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.qty}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Price</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.price}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Order Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.order_date}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Consumer</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.consumer_email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Store</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{selectedItem.store_name}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default OrderItems;

  const filteredItems = itemsData.filter((i) => (i.product.toLowerCase().includes(searchTerm.toLowerCase())) && (statusFilter === 'all' || i.status === statusFilter));
  const handleMenuOpen = (event, item) => { setAnchorEl(event.currentTarget); setSelectedItem(item); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDetail = (item) => { setSelectedItem(item); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); };

  const stats = [
    { label: 'Total Items', value: itemsData.length, color: '#1976d2' },
    { label: 'Delivered', value: itemsData.filter(i => i.status === 'delivered').length, color: '#388e3c' },
    { label: 'In Transit', value: itemsData.filter(i => i.status === 'in-transit').length, color: '#f57c00' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (<Grid item xs={12} sm={6} md={3} key={idx}><Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}><CardContent><Typography color="textSecondary">{stat.label}</Typography><Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>{stat.value}</Typography></CardContent></Card></Grid>))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth placeholder="Search by product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}><MenuItem value="all">All</MenuItem><MenuItem value="delivered">Delivered</MenuItem><MenuItem value="in-transit">In Transit</MenuItem><MenuItem value="processing">Processing</MenuItem></Select></FormControl></Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((i) => (<TableRow key={i.id}><TableCell sx={{ fontWeight: 500 }}>{i.orderId}</TableCell><TableCell>{i.product}</TableCell><TableCell>{i.qty}</TableCell><TableCell sx={{ fontWeight: 'bold' }}>{i.price}</TableCell><TableCell><Chip label={i.status} color={i.status === 'delivered' ? 'success' : 'warning'} size="small" /></TableCell><TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, i)}><MoreVertIcon /></IconButton></TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedItem)}>View Details</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Order Item Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedItem && (<Box><Grid container spacing={2}><Grid item xs={12}><Typography variant="caption" color="textSecondary">Order ID</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.orderId}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Product</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.product}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="textSecondary">Quantity</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.qty}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="textSecondary">Price</Typography><Typography sx={{ fontWeight: 500 }}>{selectedItem.price}</Typography></Grid></Grid></Box>)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default OrderItems;
