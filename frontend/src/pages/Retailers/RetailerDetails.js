import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { retailersAPI } from '../../services/apiService';

const RetailerDetails = () => {
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await retailersAPI.getAll({ limit: 1000 });
        const data = response.data?.data || response.data || [];
        const list = Array.isArray(data) ? data : [];
        setRetailers(list);
        if (list.length > 0) {
          setSelectedRetailer(list[0]);
        }
      } catch (err) {
        console.error('Error fetching retailer details:', err);
        setError('Unable to load retailer details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  const filteredRetailers = retailers.filter((retailer) => {
    const name = retailer.retailer_name || '';
    const email = retailer.email || '';
    const phone = retailer.phone || '';
    const pan = retailer.pan_card || '';

    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.toLowerCase().includes(searchText.toLowerCase()) ||
      pan.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleSelectRetailer = (retailer) => {
    setSelectedRetailer(retailer);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          🧾 Retailer Details
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Select a retailer to inspect profile, verification, and account metadata.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search retailers..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                }}
              />
              {loading ? (
                <Typography>Loading retailers...</Typography>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
                  <Table stickyHeader>
                    <TableHead sx={{ background: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRetailers.map((retailer) => (
                        <TableRow
                          key={retailer._id}
                          hover
                          selected={selectedRetailer?._id === retailer._id}
                          onClick={() => handleSelectRetailer(retailer)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{retailer.retailer_name || 'Unknown'}</TableCell>
                          <TableCell>{retailer.phone || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Retailer Profile
              </Typography>
              {!selectedRetailer ? (
                <Alert severity="info">Select a retailer from the list to view details.</Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Retailer Name</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{selectedRetailer.retailer_name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Email</Typography>
                    <Typography>{selectedRetailer.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Phone</Typography>
                    <Typography>{selectedRetailer.phone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>PAN Card</Typography>
                    <Typography>{selectedRetailer.pan_card || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Phone Verified</Typography>
                    <Chip label={selectedRetailer.phone_verified ? 'Yes' : 'No'} color={selectedRetailer.phone_verified ? 'success' : 'default'} size="small" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Email Verified</Typography>
                    <Chip label={selectedRetailer.email_verified ? 'Yes' : 'No'} color={selectedRetailer.email_verified ? 'success' : 'default'} size="small" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Account Status</Typography>
                    <Chip
                      label={selectedRetailer.status || (selectedRetailer.phone_verified && selectedRetailer.email_verified ? 'active' : 'pending')}
                      color={selectedRetailer.status === 'suspended' ? 'error' : 'success'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Joined</Typography>
                    <Typography>{selectedRetailer.createdAt ? new Date(selectedRetailer.createdAt).toLocaleDateString() : 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" sx={{ mt: 2 }} disabled>
                      Edit Retailer (API integration pending)
                    </Button>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetailerDetails;
