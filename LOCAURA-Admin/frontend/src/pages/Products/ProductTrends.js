import React from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';

const ProductTrends = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Product Trends</Typography><Grid container spacing={2}><Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Top Selling</Typography><Typography variant="body2">Electronics (35%)</Typography><Typography variant="body2">Fashion (25%)</Typography><Typography variant="body2">Home (20%)</Typography></CardContent></Card></Grid></Grid></Container>
);

export default ProductTrends;
