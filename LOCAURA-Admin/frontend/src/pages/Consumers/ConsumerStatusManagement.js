import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Alert,
} from '@mui/material';
import { Search, Phone, Email } from '@mui/icons-material';
import { consumersAPI } from '../../services/apiService';

const ConsumerStatusManagement = () => {
  const [consumers, setConsumers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersAPI.getAll({ limit: 1000 });
      const data = response.data?.data || response.data || response || [];
      setConsumers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching consumers for status management:', err);
      setError('Unable to load consumer statuses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredConsumers = consumers.filter((consumer) => {
    const name = consumer.consumer_name || '';
    const email = consumer.email || '';
    const phone = consumer.phone || '';
    const matchesSearch =
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.includes(searchText);
    const matchesStatus = statusFilter === 'all' || consumer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔧 Consumer Status Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Review and compare consumer account status and verification data.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E8F5E9' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              {consumers.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#388E3C' }}>
              Consumers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E3F2FD' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
              {consumers.filter((c) => c.status === 'active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1976D2' }}>
              Active
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#FFF8E1' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F57F17' }}>
              {consumers.filter((c) => c.status === 'suspended').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#F9A825' }}>
              Suspended
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#FFEBEE' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#C62828' }}>
              {consumers.filter((c) => c.status === 'deleted').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#D32F2F' }}>
              Deleted
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                sx={{ background: '#f5f5f5' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                }}
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
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Verified</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Addresses</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Last Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : filteredConsumers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">No consumers found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredConsumers.map((consumer) => (
                <TableRow key={consumer._id} sx={{ '&:hover': { background: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, background: '#2196F3' }}>
                        {consumer.consumer_name?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {consumer.consumer_name || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: '#666' }} />
                      {consumer.email || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone sx={{ fontSize: 16, color: '#666' }} />
                      {consumer.phone || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={consumer.phone_verified ? 'Yes' : 'No'}
                      color={consumer.phone_verified ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={consumer.status || 'unknown'} color={getStatusColor(consumer.status)} size="small" />
                  </TableCell>
                  <TableCell>{(consumer.addresses?.length ?? 0) || 0}</TableCell>
                  <TableCell>
                    {consumer.updatedAt ? new Date(consumer.updatedAt).toLocaleDateString('en-IN') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ConsumerStatusManagement;
