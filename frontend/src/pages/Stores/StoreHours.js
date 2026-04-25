import React, { useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, Switch, FormControlLabel, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';

// Stub pages for remaining features
const StoreHours = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const storesData = [];

  const filteredStores = storesData.filter((s) => s.store.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleMenuOpen = (event, store) => { setAnchorEl(event.currentTarget); setSelectedStore(store); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenDetail = (store) => { setSelectedStore(store); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h5" sx={{ fontWeight: 'bold' }}>{ storesData.length}</Typography><Typography color="textSecondary" fontSize="small">Total Stores</Typography></CardContent></Card></Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}><TextField fullWidth placeholder="Search by store name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Monday</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tuesday</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStores.map((s) => (<TableRow key={s.id}><TableCell sx={{ fontWeight: 500 }}>{s.store}</TableCell><TableCell>{s.monday}</TableCell><TableCell>{s.tuesday}</TableCell><TableCell><Chip label={s.status} color="success" size="small" /></TableCell><TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, s)}><MoreVertIcon /></IconButton></TableCell></TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedStore)}>View Details</MenuItem>
        <MenuItem>Edit Hours</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Store Hours</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedStore && (<Box><Grid container spacing={2}><Grid item xs={12}><Typography variant="caption" color="textSecondary">Store</Typography><Typography sx={{ fontWeight: 500 }}>{selectedStore.store}</Typography></Grid></Grid></Box>)}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default StoreHours;
