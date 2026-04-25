import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, Grid, Card, CardContent, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import InteractiveDataTable from '../../components/InteractiveDataTable/InteractiveDataTable';

const CartHistory = () => {
  const [cartHistory, setCartHistory] = useState([]);

  const columns = [
    { field: 'consumer_name', label: 'Consumer' },
    { field: 'store_name', label: 'Store' },
    { field: 'items_count', label: 'Items' },
    { field: 'total_value', label: 'Value (₹)' },
    { field: 'conversion_status', label: 'Status' },
    { field: 'completion_date', label: 'Completed On' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Cart History</Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Total Carts</Typography><Typography variant="h4">{cartHistory.length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Purchased</Typography><Typography variant="h4" sx={{ color: '#388e3c' }}>{cartHistory.filter(c => c.conversion_status === 'purchased').length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Abandoned</Typography><Typography variant="h4" sx={{ color: '#d32f2f' }}>{cartHistory.filter(c => c.conversion_status === 'abandoned').length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Conversion Rate</Typography><Typography variant="h4" sx={{ color: '#1976d2' }}>{((cartHistory.filter(c => c.conversion_status === 'purchased').length / cartHistory.length) * 100).toFixed(1)}%</Typography></CardContent></Card></Grid>
        </Grid>
      </Box>

      <InteractiveDataTable
        title="Cart History"
        columns={columns}
        data={cartHistory}
        onUpdate={setCartHistory}
        editableFields={['conversion_status']}
      />
    </Container>
  );
};

export default CartHistory;
