import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { ridersAPI } from '../../services/apiService';

const RiderLocation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || [])
          .filter((rider) => Array.isArray(rider.current_location?.coordinates) && rider.current_location.coordinates.length === 2)
          .map((rider) => ({
            id: rider._id,
            rider: rider.name || '-',
            lat: rider.current_location.coordinates[1],
            lng: rider.current_location.coordinates[0],
            area: rider.assigned_zones?.length ? `Zones: ${rider.assigned_zones.length}` : `Radius: ${rider.service_radius || 5} km`,
            status: rider.is_online ? 'Online' : 'Offline',
          }));
        setData(mapped);
      } catch (err) {
        setError('Failed to fetch rider locations');
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Rider Location Tracking</Typography>
      {loading && <Typography sx={{ mb: 2 }}>Loading rider locations...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Card sx={{ mb: 3 }}><CardContent><Typography variant="h6">Active Riders: {data.filter((r) => r.status === 'Online').length}</Typography><Typography color="textSecondary">Real-time location tracking enabled</Typography></CardContent></Card>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Area</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (<TableRow key={r.id}><TableCell sx={{ fontWeight: 500 }}>{r.rider}</TableCell><TableCell sx={{ fontSize: 'small' }}>{Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}</TableCell><TableCell>{r.area}</TableCell><TableCell><Chip label={r.status} color={r.status === 'Online' ? 'success' : 'default'} size="small" /></TableCell></TableRow>))}
            {!loading && data.length === 0 && (<TableRow><TableCell colSpan={4} align="center">No riders with live location found</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RiderLocation;
