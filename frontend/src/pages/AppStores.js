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
import { storesAPI } from '../services/apiService';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

function AppStores() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await storesAPI.getAll();
      setStores(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const filterStores = useCallback(() => {
    let filtered = stores;
    if (searchTerm) {
      filtered = filtered.filter(
        (store) =>
          store.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((store) => store.status === statusFilter);
    }
    setFilteredStores(filtered);
  }, [stores, searchTerm, statusFilter]);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [filterStores]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedStores = filteredStores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    const colorMap = { active: 'success', pending: 'warning', blocked: 'error' };
    return colorMap[status] || 'default';
  };

  const handleDeleteClick = (store) => {
    setStoreToDelete(store);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;

    try {
      await storesAPI.delete(storeToDelete._id);
      setStores(stores.filter(store => store._id !== storeToDelete._id));
      setFilteredStores(filteredStores.filter(store => store._id !== storeToDelete._id));
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    } catch (err) {
      console.error('Error deleting store:', err);
      setError('Failed to delete store');
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setStoreToDelete(null);
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>🏪 Stores Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" size="small" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchStores}>Refresh</Button>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedStores.map((store) => (
                <TableRow key={store._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{store.store_name}</Typography></TableCell>
                  <TableCell>{store.store_email || 'N/A'}</TableCell>
                  <TableCell>{store.store_phone || 'N/A'}</TableCell>
                  <TableCell><Chip label={store.status} color={getStatusColor(store.status)} size="small" /></TableCell>
                  <TableCell>{store.rating ? `${store.rating}⭐` : 'N/A'}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#f44336' }} onClick={() => handleDeleteClick(store)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredStores.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Store"
        itemName={`Store - ${storeToDelete?.store_name || 'Store'}`}
        timeout={10}
      />
    </Box>
  );
};

export default AppStores;