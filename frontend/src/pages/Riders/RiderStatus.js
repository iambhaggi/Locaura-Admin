import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { ridersAPI } from '../../services/apiService';

const RiderStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((rider) => ({
          id: rider._id,
          rider: rider.name || '-',
          current: rider.is_online ? 'Online' : 'Offline',
          rating: Number(rider.average_rating || 0),
          deliveries: Number(rider.total_deliveries || 0),
        }));
        setData(mapped);
      } catch (err) {
        setError('Failed to fetch rider status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Rider Status</Typography>
      {loading && <Typography sx={{ mb: 2 }}>Loading rider status...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card><CardContent><Typography variant="h6">Online</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>{data.filter((r) => r.current === 'Online').length}/{data.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent><Typography variant="h6">Offline</Typography><Typography variant="h4" sx={{ color: '#d32f2f' }}>{data.filter((r) => r.current === 'Offline').length}/{data.length}</Typography></CardContent></Card>
        </Grid>
      </Grid>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Deliveries</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (<TableRow key={r.id}><TableCell>{r.rider}</TableCell><TableCell><Chip label={r.current} color={r.current === 'Online' ? 'success' : 'default'} size="small" /></TableCell><TableCell>{r.rating}⭐</TableCell><TableCell>{r.deliveries}</TableCell></TableRow>))}
            {!loading && data.length === 0 && (<TableRow><TableCell colSpan={4} align="center">No rider status records found</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RiderStatus;
