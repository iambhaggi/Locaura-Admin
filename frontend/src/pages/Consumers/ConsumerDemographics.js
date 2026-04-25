import React from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';

const ConsumerDemographics = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Consumer Demographics</Typography><Grid container spacing={2}><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Age 18-25</Typography><Typography variant="h4">45%</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Age 26-35</Typography><Typography variant="h4">35%</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Age 36-45</Typography><Typography variant="h4">15%</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Age 45+</Typography><Typography variant="h4">5%</Typography></CardContent></Card></Grid></Grid></Container>
);

export default ConsumerDemographics;
