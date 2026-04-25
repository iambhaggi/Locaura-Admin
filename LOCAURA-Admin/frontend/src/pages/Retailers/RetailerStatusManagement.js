import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { retailersAPI } from '../../services/apiService';

const RetailerStatusManagement = () => {
  const [retailers, setRetailers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await retailersAPI.getAll({ limit: 1000 });
        const data = response.data?.data || response.data || [];
        setRetailers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching retailer statuses:', err);
        setError('Unable to load retailer statuses.');
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  const getRetailerStatus = (retailer) => {
    if (retailer.status) return retailer.status;
    if (retailer.phone_verified && retailer.email_verified) return 'active';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredRetailers = retailers.filter((retailer) => {
    const name = retailer.retailer_name || '';
    const email = retailer.email || '';
    const phone = retailer.phone || '';
    const status = getRetailerStatus(retailer);

    const matchesSearch =
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          🏪 Retailer Status Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          View retailer verification state and account statuses.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#E3F2FD' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              {retailers.length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1976D2' }}>
              Total Retailers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#C8E6C9' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {retailers.filter((retailer) => getRetailerStatus(retailer) === 'active').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#388E3C' }}>
              Active Retailers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#FFF8E1' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F57F17' }}>
              {retailers.filter((retailer) => getRetailerStatus(retailer) === 'pending').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#F9A825' }}>
              Pending Review
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: '#FFEBEE' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#C62828' }}>
              {retailers.filter((retailer) => retailer.status === 'suspended').length}
            </Typography>
            <Typography variant="body2" sx={{ color: '#D32F2F' }}>
              Suspended
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by retailer name, email, or phone..."
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
            <Grid item xs={12} md={4}>
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Retailer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone Verified</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email Verified</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="error">{error}</Alert>
                </TableCell>
              </TableRow>
            ) : filteredRetailers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">No retailers match your filter</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredRetailers.map((retailer) => {
                const status = getRetailerStatus(retailer);
                return (
                  <TableRow key={retailer._id} sx={{ '&:hover': { background: '#f9f9f9' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                          {retailer.retailer_name?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {retailer.retailer_name || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{retailer.email || 'N/A'}</TableCell>
                    <TableCell>{retailer.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={retailer.phone_verified ? 'Yes' : 'No'}
                        color={retailer.phone_verified ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={retailer.email_verified ? 'Yes' : 'No'}
                        color={retailer.email_verified ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={status} color={getStatusColor(status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RetailerStatusManagement;
