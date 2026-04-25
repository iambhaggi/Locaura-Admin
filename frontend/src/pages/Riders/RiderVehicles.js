import React, { useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';

const RiderVehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

const vehiclesData = [];

  const filteredVehicles = vehiclesData.filter((v) => (v.rider.toLowerCase().includes(searchTerm.toLowerCase())) && (statusFilter === 'all' || v.status === statusFilter));

  const handleMenuOpen = (event, vehicle) => { setAnchorEl(event.currentTarget); setSelectedVehicle(vehicle); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDetail = (vehicle) => { setSelectedVehicle(vehicle); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); };

  const stats = [
    { label: 'Total Vehicles', value: vehiclesData.length, color: '#1976d2' },
    { label: 'Active', value: vehiclesData.filter(v => v.status === 'active').length, color: '#388e3c' },
    { label: 'Insurance Active', value: vehiclesData.filter(v => v.insurance === 'Active').length, color: '#f57c00' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (<Grid item xs={12} sm={6} md={3} key={idx}><Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}><CardContent><Typography color="textSecondary" gutterBottom>{stat.label}</Typography><Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>{stat.value}</Typography></CardContent></Card></Grid>))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth placeholder="Search by rider name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}><MenuItem value="all">All</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></Select></FormControl></Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Vehicle No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Insurance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((v) => (<TableRow key={v.id}><TableCell sx={{ fontWeight: 500 }}>{v.rider}</TableCell><TableCell>{v.type}</TableCell><TableCell>{v.vehicle_no}</TableCell><TableCell><Chip label={v.insurance} color={v.insurance === 'Active' ? 'success' : 'error'} size="small" /></TableCell><TableCell><Chip label={v.status} color={v.status === 'active' ? 'success' : 'default'} size="small" /></TableCell><TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, v)}><MoreVertIcon /></IconButton></TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedVehicle)}>View Details</MenuItem>
        <MenuItem>Update Insurance</MenuItem>
        <MenuItem>Deactivate Vehicle</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Vehicle Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedVehicle && (<Box><Grid container spacing={2}><Grid item xs={12}><Typography variant="caption" color="textSecondary">Rider</Typography><Typography sx={{ fontWeight: 500 }}>{selectedVehicle.rider}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="textSecondary">Type</Typography><Typography sx={{ fontWeight: 500 }}>{selectedVehicle.type}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="textSecondary">Vehicle Number</Typography><Typography sx={{ fontWeight: 500 }}>{selectedVehicle.vehicle_no}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Insurance Status</Typography><Chip label={selectedVehicle.insurance} color={selectedVehicle.insurance === 'Active' ? 'success' : 'error'} size="small" /></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Insurance Expires</Typography><Typography sx={{ fontWeight: 500 }}>{selectedVehicle.insurance_expires}</Typography></Grid></Grid></Box>)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RiderVehicles;
