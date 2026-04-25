import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { consumersAPI } from '../services/apiService';
import ConsumerProfile from '../components/ConsumerProfile/ConsumerProfile';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

function AppConsumers() {
  const [consumers, setConsumers] = useState([]);
  const [filteredConsumers, setFilteredConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const detailId = searchParams.get('id');
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consumerToDelete, setConsumerToDelete] = useState(null);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await consumersAPI.getAll();
      setConsumers(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching consumers:', err);
      setError(err.message || 'Failed to load consumers');
    } finally {
      setLoading(false);
    }
  };

  const filterConsumers = useCallback(() => {
    let filtered = consumers;
    if (searchTerm) {
      filtered = filtered.filter(
        (consumer) =>
          consumer.phone?.toString().includes(searchTerm) ||
          consumer.phone_verified?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((consumer) => consumer.status === statusFilter);
    }
    setFilteredConsumers(filtered);
  }, [consumers, searchTerm, statusFilter]);

  useEffect(() => {
    fetchConsumers();
  }, []);

  useEffect(() => {
    if (detailId && consumers.length > 0) {
      const consumer = consumers.find((c) => c._id === detailId || c.id === detailId);
      if (consumer) {
        setSelectedConsumer(consumer);
        setProfileDialogOpen(true);
      }
    }
  }, [detailId, consumers]);

  useEffect(() => {
    filterConsumers();
  }, [filterConsumers]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (consumer) => {
    setSelectedConsumer(consumer);
    setProfileDialogOpen(true);
    navigate(`/consumers/details?id=${consumer._id}`);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedConsumer(null);
    navigate('/consumers');
  };

  const handleDeleteClick = (consumer) => {
    setConsumerToDelete(consumer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!consumerToDelete) return;

    try {
      await consumersAPI.delete(consumerToDelete._id);
      setConsumers(consumers.filter(consumer => consumer._id !== consumerToDelete._id));
      setFilteredConsumers(filteredConsumers.filter(consumer => consumer._id !== consumerToDelete._id));
      setDeleteDialogOpen(false);
      setConsumerToDelete(null);
    } catch (err) {
      console.error('Error deleting consumer:', err);
      setError('Failed to delete consumer');
      setDeleteDialogOpen(false);
      setConsumerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setConsumerToDelete(null);
  };

  const displayedConsumers = filteredConsumers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    const colorMap = { active: 'success', inactive: 'error' };
    return colorMap[status] || 'default';
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>👥 Consumers Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by phone"
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
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={fetchConsumers}>Refresh</Button>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone Verified</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Addresses</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Joined Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedConsumers.map((consumer) => (
                <TableRow key={consumer._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{consumer.phone}</Typography></TableCell>
                  <TableCell><Chip label={consumer.phone_verified ? 'Yes' : 'No'} color={consumer.phone_verified ? 'success' : 'default'} size="small" /></TableCell>
                  <TableCell><Chip label={consumer.status} color={getStatusColor(consumer.status)} size="small" /></TableCell>
                  <TableCell>{consumer.addresses?.length || 0} addresses</TableCell>
                  <TableCell>{new Date(consumer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleViewDetails(consumer)} sx={{ mr: 1 }}>
                      View Details
                    </Button>
                    <Button size="small" sx={{ color: '#f44336' }} onClick={() => handleDeleteClick(consumer)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredConsumers.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>
      <ConsumerProfile consumer={selectedConsumer} open={profileDialogOpen} onClose={handleCloseProfile} />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Consumer"
        itemName={`Consumer - ${consumerToDelete?.phone || 'Consumer'}`}
        timeout={10}
      />
    </Box>
  );
}

export default AppConsumers;