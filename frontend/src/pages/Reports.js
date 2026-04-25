import React from 'react';
import { Container, Typography, Card, CardContent, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const Reports = () => {
  const reports = [];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Reports</Typography>
      <Box sx={{ mb: 3 }}><Button variant="contained" color="primary">Generate Report</Button></Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Report Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((r) => (<TableRow key={r.id}><TableCell>{r.name}</TableCell><TableCell>{r.date}</TableCell><TableCell>{r.status}</TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Reports;
