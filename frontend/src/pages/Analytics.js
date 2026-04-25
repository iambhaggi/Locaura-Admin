import React from 'react';
import { Container, Typography, Card, CardContent, Grid, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@mui/material';

const Analytics = () => (
  <Container sx={{ py: 4 }}><Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Analytics Dashboard</Typography><Grid container spacing={2}><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Total Users</Typography><Typography variant="h4">5,230</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Active Users</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>3,100</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Total Orders</Typography><Typography variant="h4">12,450</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Revenue</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>₹50L</Typography></CardContent></Card></Grid></Grid></Container>
);

export default Analytics;
