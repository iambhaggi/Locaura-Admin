import React from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';

const RetailerPerformance = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Retailer Performance</Typography><Grid container spacing={2}><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Total Sales</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>₹50,000</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Avg Rating</Typography><Typography variant="h4" sx={{ color: '#1976d2' }}>4.5★</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Orders</Typography><Typography variant="h4">125</Typography></CardContent></Card></Grid></Grid></Container>
);

export default RetailerPerformance;
