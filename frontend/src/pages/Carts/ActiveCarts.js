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
  Button,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ActiveCarts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCart, setSelectedCart] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const cartsData = [];

  const filteredCarts = cartsData.filter(
    (cart) =>
      (cart.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || cart.status === statusFilter)
  );

  const handleMenuOpen = (event, cart) => {
    setAnchorEl(event.currentTarget);
    setSelectedCart(cart);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDetail = (cart) => {
    setSelectedCart(cart);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedCart(null);
  };

  const stats = [
    { label: 'Total Active Carts', value: cartsData.filter((c) => c.status === 'active').length, color: '#1976d2' },
    { label: 'Abandoned Carts', value: cartsData.filter((c) => c.status === 'abandoned').length, color: '#d32f2f' },
    { label: 'Total Cart Value', value: '₹14,494', color: '#388e3c' },
    { label: 'Avg Items per Cart', value: '3.0', color: '#f57c00' },
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
              placeholder="Search by consumer name, email, or cart ID..."
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
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="abandoned">Abandoned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Carts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Cart ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Items
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Total Value
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCarts.map((cart) => (
              <TableRow key={cart.id} sx={{ '&:hover': { background: '#f5f5f5' } }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{cart.id}</TableCell>
                <TableCell>{cart.consumerName}</TableCell>
                <TableCell align="right">
                  <Chip
                    icon={<ShoppingCartIcon />}
                    label={cart.items}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {cart.totalValue}
                </TableCell>
                <TableCell>
                  <Chip
                    label={cart.status}
                    color={cart.status === 'active' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 'small' }}>{cart.createdAt}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, cart)}
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
            handleOpenDetail(selectedCart);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem>Send Reminder</MenuItem>
        <MenuItem>Apply Discount</MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Shopping Cart Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedCart && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Cart ID
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedCart.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Consumer
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedCart.consumerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedCart.status}
                    color={selectedCart.status === 'active' ? 'success' : 'warning'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedCart.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedCart.phone}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Items
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedCart.items}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Total Value
                  </Typography>
                  <Typography sx={{ fontWeight: 500, color: '#388e3c' }}>
                    {selectedCart.totalValue}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 'small' }}>
                    {selectedCart.createdAt}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 'small' }}>
                    {selectedCart.lastUpdated}
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

export default ActiveCarts;
