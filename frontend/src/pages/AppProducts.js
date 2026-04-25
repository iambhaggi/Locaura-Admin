import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { productsAPI, storesAPI } from '../services/apiService';

function AppProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productsAPI.getAll();
      setProducts(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll();
      setStores(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const filterProducts = useCallback(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (storeFilter) {
      filtered = filtered.filter((product) => product.store_id === storeFilter);
    }
    setFilteredProducts(filtered);
  }, [products, searchTerm, storeFilter]);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStoreNameById = (storeId) => {
    const store = stores.find((s) => s._id === storeId);
    return store?.store_name || 'N/A';
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>📦 Products Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by product name"
            variant="outlined"
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Store</InputLabel>
            <Select value={storeFilter} label="Store" size="small" onChange={(e) => { setStoreFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All Stores</MenuItem>
              {stores.map((store) => (
                <MenuItem key={store._id} value={store._id}>{store.store_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchProducts}>Refresh</Button>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProducts.map((product) => (
                <TableRow key={product._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{product.name}</Typography></TableCell>
                  <TableCell>{getStoreNameById(product.store_id)}</TableCell>
                  <TableCell>₹{product.base_price}</TableCell>
                  <TableCell>{product.rating ? `${product.rating}⭐` : 'N/A'}</TableCell>
                  <TableCell>{product.total_stock || 0}</TableCell>
                  <TableCell><Chip label={product.status || 'active'} color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredProducts.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>
    </Box>
  );
};

export default AppProducts;