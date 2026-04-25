import React, { useEffect, useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { ridersAPI } from '../../services/apiService';

const RiderKYC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((rider) => ({
          id: rider._id,
          rider: rider.name || '-',
          phone: rider.phone || '-',
          aadhar: rider.aadhaar_number || '-',
          license: rider.driving_license_number || '-',
          status: rider.kyc_status || 'pending',
          kyc_verified_date: rider.onboarded_at ? new Date(rider.onboarded_at).toLocaleDateString() : '-',
          background_check: rider.status === 'VERIFIED' || rider.status === 'ACTIVE' ? 'passed' : 'pending',
        }));
        setKycData(mapped);
      } catch (err) {
        setError('Failed to fetch rider KYC data');
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);
  const filteredKYC = kycData.filter((k) => (k.rider.toLowerCase().includes(searchTerm.toLowerCase())) && (statusFilter === 'all' || k.status === statusFilter));

  const handleMenuOpen = (event, kyc) => { setAnchorEl(event.currentTarget); setSelectedKYC(kyc); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDetail = (kyc) => { setSelectedKYC(kyc); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); };

  const stats = [
    { label: 'Total Riders', value: kycData.length, color: '#1976d2' },
    { label: 'Verified', value: kycData.filter(k => k.status === 'verified').length, color: '#388e3c' },
    { label: 'Pending', value: kycData.filter(k => k.status === 'pending').length, color: '#f57c00' },
    { label: 'Expiring Soon', value: '1', color: '#d32f2f' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading rider KYC...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (<Grid item xs={12} sm={6} md={3} key={idx}><Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}><CardContent><Typography color="textSecondary" gutterBottom>{stat.label}</Typography><Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>{stat.value}</Typography></CardContent></Card></Grid>))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}><TextField fullWidth placeholder="Search by rider name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Grid>
          <Grid item xs={12} sm={6} md={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}><MenuItem value="all">All</MenuItem><MenuItem value="verified">Verified</MenuItem><MenuItem value="pending">Pending</MenuItem></Select></FormControl></Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Aadhar</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>License</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKYC.map((kyc) => (<TableRow key={kyc.id}><TableCell sx={{ fontWeight: 500 }}>{kyc.rider}</TableCell><TableCell>{kyc.phone}</TableCell><TableCell>{kyc.aadhar}</TableCell><TableCell>{kyc.license}</TableCell><TableCell><Chip label={kyc.status} color={kyc.status === 'verified' ? 'success' : 'warning'} size="small" /></TableCell><TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, kyc)}><MoreVertIcon /></IconButton></TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedKYC)}>View Details</MenuItem>
        <MenuItem>Approve KYC</MenuItem>
        <MenuItem>Request Documents</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>KYC Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedKYC && (<Box><Grid container spacing={2}><Grid item xs={12}><Typography variant="caption" color="textSecondary">Rider</Typography><Typography sx={{ fontWeight: 500 }}>{selectedKYC.rider}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Phone</Typography><Typography sx={{ fontWeight: 500 }}>{selectedKYC.phone}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="textSecondary">Aadhar</Typography><Typography sx={{ fontWeight: 500 }}>{selectedKYC.aadhar}</Typography></Grid><Grid item xs={6}><Typography variant="caption" color="textSecondary">License</Typography><Typography sx={{ fontWeight: 500 }}>{selectedKYC.license}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Status</Typography><Chip label={selectedKYC.status} color={selectedKYC.status === 'verified' ? 'success' : 'warning'} size="small" /></Grid></Grid></Box>)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RiderKYC;
