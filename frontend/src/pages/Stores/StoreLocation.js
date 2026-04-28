import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

import { storesAPI } from '../../services/apiService';

const StoreLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await storesAPI.getAll();
        setLocations((response.data?.data || response.data || []).map(store => ({
          ...store,
          city: store.address?.city || '',
          state: store.address?.state || '',
          delivery_radius: store.delivery_radius_km || store.delivery_radius || 0,
          service_zones: store.service_zones || [],
        })));
      } catch (err) {
        setError('Failed to fetch store locations');
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleViewDetails = (location) => {
    setSelectedLocation(location);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedLocation(null);
  };

  const filteredLocations = locations.filter((loc) =>
    (loc.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        📍 Store Locations & Delivery Zones
      </Typography>
      {loading && <Typography>Loading locations...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by store name or city..."
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
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Delivery Radius</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service Zones</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLocations.map((location) => (
              <TableRow key={location._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff7043' }}>
                      {location.store_name.charAt(0)}
                    </Avatar>
                    {location.store_name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16 }} />
                    {location.city}, {location.state}
                  </Box>
                </TableCell>
                <TableCell>{location.delivery_radius} km</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {location.service_zones.map((zone) => (
                      <Chip key={zone} label={zone} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(location)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Store Location Details</DialogTitle>
        <DialogContent dividers>
          {selectedLocation && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                📍 Location Information
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Store
                  </Typography>
                  <Typography>{selectedLocation.store_name}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Address
                  </Typography>
                  <Typography>{selectedLocation.address}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Latitude, Longitude
                  </Typography>
                  <Typography>
                    {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Delivery Radius
                  </Typography>
                  <Typography>{selectedLocation.delivery_radius} km</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🌐 Service Zones
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pl: 2 }}>
                {selectedLocation.service_zones.map((zone) => (
                  <Chip key={zone} label={zone} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button variant="contained">Edit Location</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreLocation;
