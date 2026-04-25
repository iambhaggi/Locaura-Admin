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
import { Delete } from '@mui/icons-material';
import { ridersAPI } from '../services/apiService';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

function AppRiders() {
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState(null);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ridersAPI.getAll();
      setRiders(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching riders:', err);
      setError(err.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  const filterRiders = useCallback(() => {
    let filtered = riders;
    if (searchTerm) {
      filtered = filtered.filter(
        (rider) =>
          rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((rider) => rider.status === statusFilter);
    }
    setFilteredRiders(filtered);
  }, [riders, searchTerm, statusFilter]);

  useEffect(() => {
    fetchRiders();
  }, []);

  useEffect(() => {
    filterRiders();
  }, [filterRiders]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const updateRiderStatus = async (riderId, newStatus) => {
    try {
      await ridersAPI.updateStatus(riderId, newStatus);
      fetchRiders();
    } catch (err) {
      setError('Failed to update rider status');
    }
  };

  const handleDeleteClick = (rider) => {
    setRiderToDelete(rider);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!riderToDelete) return;

    try {
      await ridersAPI.delete(riderToDelete._id);
      setRiders(riders.filter(rider => rider._id !== riderToDelete._id));
      setFilteredRiders(filteredRiders.filter(rider => rider._id !== riderToDelete._id));
      setDeleteDialogOpen(false);
      setRiderToDelete(null);
    } catch (err) {
      console.error('Error deleting rider:', err);
      setError('Failed to delete rider');
      setDeleteDialogOpen(false);
      setRiderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRiderToDelete(null);
  };

  const displayedRiders = filteredRiders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    const colorMap = { active: 'success', pending: 'warning', blocked: 'error' };
    return colorMap[status] || 'default';
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>🚚 Riders Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by name or email"
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
          <Button variant="outlined" onClick={fetchRiders}>Refresh</Button>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRiders.map((rider) => (
                <TableRow key={rider._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{rider.name}</Typography></TableCell>
                  <TableCell>{rider.email}</TableCell>
                  <TableCell>{rider.phone}</TableCell>
                  <TableCell>
                    <Select size="small" value={rider.status} onChange={(e) => updateRiderStatus(rider._id, e.target.value)}>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="blocked">Blocked</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>{rider.rating ? `${rider.rating}⭐` : 'N/A'}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ color: '#2196f3', mr: 1 }}>View</Button>
                    <Button size="small" sx={{ color: '#f44336' }} onClick={() => handleDeleteClick(rider)}>
                      <Delete sx={{ mr: 0.5 }} />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredRiders.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Rider"
        itemName={`Rider - ${riderToDelete?.name || 'Rider'}`}
        timeout={10}
      />
    </Box>
  );
};

export default AppRiders;