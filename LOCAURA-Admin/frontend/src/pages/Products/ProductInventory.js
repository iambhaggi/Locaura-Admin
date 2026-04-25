import React from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';

const ProductInventory = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Product Inventory</Typography><Grid container spacing={2}><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Total Products</Typography><Typography variant="h4">2,540</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">In Stock</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>2,450</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Low Stock</Typography><Typography variant="h4" sx={{ color: '#f57c00' }}>85</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Out of Stock</Typography><Typography variant="h4" sx={{ color: '#d32f2f' }}>5</Typography></CardContent></Card></Grid></Grid></Container>
);

export default ProductInventory;
