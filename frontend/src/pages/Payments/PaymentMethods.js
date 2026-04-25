import React, { useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';

const PaymentMethods = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const methodsData = [];

  const filteredMethods = methodsData.filter((m) => m.consumer.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleMenuOpen = (event, method) => { setAnchorEl(event.currentTarget); setSelectedMethod(method); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDetail = (method) => { setSelectedMethod(method); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); };

  const stats = [
    { label: 'Total Methods', value: methodsData.length, color: '#1976d2' },
    { label: 'Card Methods', value: methodsData.filter(m => m.type === 'Card').length, color: '#388e3c' },
    { label: 'UPI Methods', value: methodsData.filter(m => m.type === 'UPI').length, color: '#f57c00' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (<Grid item xs={12} sm={6} md={3} key={idx}><Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}><CardContent><Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>{stat.value}</Typography><Typography color="textSecondary" fontSize="small">{stat.label}</Typography></CardContent></Card></Grid>))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}><TextField fullWidth placeholder="Search by consumer name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Provider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Identifier</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMethods.map((m) => (<TableRow key={m.id}><TableCell sx={{ fontWeight: 500 }}>{m.consumer}</TableCell><TableCell>{m.type}</TableCell><TableCell>{m.provider}</TableCell><TableCell>{m.type === 'Card' ? m.lastDigits : m.identifier}</TableCell><TableCell><Chip label={m.status} color={m.status === 'primary' ? 'primary' : 'default'} size="small" /></TableCell><TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, m)}><MoreVertIcon /></IconButton></TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedMethod)}>View Details</MenuItem>
        <MenuItem>Set as Primary</MenuItem>
        <MenuItem>Delete</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Payment Method</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedMethod && (<Box><Grid container spacing={2}><Grid item xs={12}><Typography variant="caption" color="textSecondary">Consumer</Typography><Typography sx={{ fontWeight: 500 }}>{selectedMethod.consumer}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Type</Typography><Typography sx={{ fontWeight: 500 }}>{selectedMethod.type}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Provider</Typography><Typography sx={{ fontWeight: 500 }}>{selectedMethod.provider}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Status</Typography><Chip label={selectedMethod.status} size="small" /></Grid></Grid></Box>)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PaymentMethods;
