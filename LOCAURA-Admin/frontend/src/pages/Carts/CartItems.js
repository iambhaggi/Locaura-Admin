import React, { useState } from 'react';
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
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const CartItems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartFilter, setCartFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const cartItemsData = [];

  const filteredItems = cartItemsData.filter(
    (item) =>
      (item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.consumer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cartId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (cartFilter === 'all' || item.status === cartFilter)
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
    setSelectedItem(null);
  };

  const stats = [
    {
      label: 'Total Items',
      value: cartItemsData.length,
      color: '#1976d2',
    },
    {
      label: 'In Cart',
      value: cartItemsData.filter((i) => i.status === 'in-cart').length,
      color: '#388e3c',
    },
    {
      label: 'Removed',
      value: cartItemsData.filter((i) => i.status === 'removed').length,
      color: '#d32f2f',
    },
    {
      label: 'Total Value',
      value: '₹5,194',
      color: '#f57c00',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              placeholder="Search by product name, SKU, or consumer..."
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
          <Grid item xs={12} sm={6} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={cartFilter}
                label="Status"
                onChange={(e) => setCartFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="in-cart">In Cart</MenuItem>
                <MenuItem value="removed">Removed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Item ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Qty
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Price/Unit
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} sx={{ '&:hover': { background: '#f5f5f5' } }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{item.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{item.product}</TableCell>
                <TableCell>{item.consumer}</TableCell>
                <TableCell>
                  <Chip label={item.sku} variant="outlined" size="small" />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <RemoveCircleIcon sx={{ fontSize: 18, cursor: 'pointer', color: '#d32f2f' }} />
                    <Typography sx={{ fontWeight: 'bold' }}>{item.qty}</Typography>
                    <AddCircleIcon sx={{ fontSize: 18, cursor: 'pointer', color: '#388e3c' }} />
                  </Box>
                </TableCell>
                <TableCell align="right">{item.pricePerUnit}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                  {item.totalPrice}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={item.status === 'in-cart' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, item)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenDetail(selectedItem);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem>Update Quantity</MenuItem>
        <MenuItem>Remove Item</MenuItem>
        <MenuItem>View Product</MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Cart Item Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedItem && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Item ID
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.id}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Product
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.product}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    SKU
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.sku}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Consumer
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.consumer}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Quantity
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.qty}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Price per Unit
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.pricePerUnit}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Total Price
                  </Typography>
                  <Typography sx={{ fontWeight: 500, color: '#388e3c', fontSize: 18 }}>
                    {selectedItem.totalPrice}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Store
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedItem.store}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedItem.status}
                    color={selectedItem.status === 'in-cart' ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Added At
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 'small' }}>
                    {selectedItem.addedAt}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CartItems;
