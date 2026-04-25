import React, { useEffect, useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { ridersAPI } from '../../services/apiService';

// Rider Bank Details
const RiderBankDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [banksData, setBanksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((rider) => ({
          id: rider._id,
          rider: rider.name || '-',
          bank: rider.bank_account_number ? 'Bank Account' : 'Not Set',
          accountNo: rider.bank_account_number || '-',
          ifsc: rider.ifsc_code || '-',
          status: rider.bank_account_number && rider.ifsc_code ? 'verified' : 'pending',
          upi: rider.upi_id || '-',
        }));
        setBanksData(mapped);
      } catch (err) {
        setError('Failed to fetch rider bank details');
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const filteredBanks = banksData.filter((b) => b.rider.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleMenuOpen = (event, bank) => { setAnchorEl(event.currentTarget); setSelectedBank(bank); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDetail = (bank) => { setSelectedBank(bank); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading rider bank details...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="textSecondary">Total Riders</Typography><Typography variant="h5" sx={{ fontWeight: 'bold' }}>{banksData.length}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="textSecondary">Verified</Typography><Typography variant="h5" sx={{ fontWeight: 'bold' }}>{banksData.filter(b => b.status === 'verified').length}</Typography></CardContent></Card></Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}><TextField fullWidth placeholder="Search by rider name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Account</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBanks.map((b) => (<TableRow key={b.id}><TableCell sx={{ fontWeight: 500 }}>{b.rider}</TableCell><TableCell>{b.bank}</TableCell><TableCell>{b.accountNo}</TableCell><TableCell><Chip label={b.status} color={b.status === 'verified' ? 'success' : 'warning'} size="small" /></TableCell><TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, b)}><MoreVertIcon /></IconButton></TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedBank)}>View Details</MenuItem>
        <MenuItem>Update Bank Details</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Bank Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBank && (<Box><Grid container spacing={2}><Grid item xs={12}><Typography variant="caption" color="textSecondary">Rider</Typography><Typography sx={{ fontWeight: 500 }}>{selectedBank.rider}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Bank Name</Typography><Typography sx={{ fontWeight: 500 }}>{selectedBank.bank}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">Account Number</Typography><Typography sx={{ fontWeight: 500 }}>{selectedBank.accountNo}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">IFSC Code</Typography><Typography sx={{ fontWeight: 500 }}>{selectedBank.ifsc}</Typography></Grid><Grid item xs={12}><Typography variant="caption" color="textSecondary">UPI</Typography><Typography sx={{ fontWeight: 500 }}>{selectedBank.upi}</Typography></Grid></Grid></Box>)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RiderBankDetails;
