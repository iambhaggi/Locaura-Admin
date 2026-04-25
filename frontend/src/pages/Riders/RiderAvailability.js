import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';
import { ridersAPI } from '../../services/apiService';

const RiderAvailability = () => {
  const [stats, setStats] = useState({ online: 0, break: 0, offline: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000 });
        const riders = response?.data?.data || response?.data || [];
        setStats({
          online: riders.filter((rider) => rider.is_online).length,
          break: riders.filter((rider) => rider.is_online && rider.is_available === false).length,
          offline: riders.filter((rider) => !rider.is_online).length,
          total: riders.length,
        });
      } catch (err) {
        setError('Failed to fetch rider availability');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Rider Availability</Typography>
      {loading && <Typography sx={{ mb: 2 }}>Loading availability...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6">Online Now</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>{stats.online}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6">On Break</Typography><Typography variant="h4" sx={{ color: '#f57c00' }}>{stats.break}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6">Offline</Typography><Typography variant="h4" sx={{ color: '#d32f2f' }}>{stats.offline}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h6">Total Riders</Typography><Typography variant="h4" sx={{ color: '#1976d2' }}>{stats.total}</Typography></CardContent></Card></Grid>
      </Grid>
    </Container>
  );
};

export default RiderAvailability;
