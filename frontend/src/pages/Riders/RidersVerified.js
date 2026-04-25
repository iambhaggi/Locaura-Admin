import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Container,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { ridersAPI } from '../../services/apiService';
const RidersVerified = () => {
  const [allRidersData, setAllRidersData] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedRider, setDeletedRider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000, kyc_status: 'verified' });
        const mapped = (response?.data?.data || response?.data || []).map((rider) => ({
          ...rider,
          rider_name: rider.name || '-',
          rating: Number(rider.average_rating || 0),
          total_trips: Number(rider.total_deliveries || 0),
          total_earnings: Number(rider.total_earnings || 0),
          background_check: rider.status === 'VERIFIED' || rider.status === 'ACTIVE' ? 'passed' : 'pending',
          kyc_verified_date: rider.onboarded_at ? new Date(rider.onboarded_at).toLocaleDateString() : '-',
          license_number: rider.driving_license_number || '-',
          vehicle_type: rider.vehicle_type || '-',
          phone: rider.phone || '-',
          email: rider.email || '-',
          kyc_status: rider.kyc_status || 'verified',
        }));
        setAllRidersData(mapped);
      } catch (err) {
        setError('Failed to fetch verified riders');
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  // Filter only verified riders
  const riders = allRidersData.filter(r => r.kyc_status === 'verified');

  const handleAddRider = () => {
    setAddDialog({
      open: true,
      data: {
        rider_name: '',
        phone: '',
        email: '',
        vehicle_type: 'Bike',
        license_number: '',
        kyc_status: 'verified',
      }
    });
  };

  const handleEditRider = (rider) => {
    setEditDialog({ open: true, data: { ...rider } });
  };

  const handleViewDetails = (rider) => {
    setDetailsDialog({ open: true, data: rider });
  };

  const handleSaveNew = () => {
    if (addDialog.data?.rider_name && addDialog.data?.phone) {
      console.log('Add verified rider:', addDialog.data);
      setAddDialog({ open: false, data: null });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      console.log('Edit verified rider:', editDialog.data);
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteClick = (rider) => {
    setRiderToDelete(rider);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (riderToDelete) {
      setDeletedRider(riderToDelete);
      setIsDeleted(true);
    }
  };

  const handleUndoDelete = () => {
    if (deletedRider) {
      setDeleteDialog(false);
      setDeletedRider(null);
      setRiderToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setRiderToDelete(null);
    }
  };

  const filteredRiders = riders.filter((rider) =>
    rider.rider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.phone.includes(searchTerm)
  );

  const stats = [
    { label: 'Verified Riders', value: riders.length, color: '#4caf50' },
    { label: 'Avg Rating', value: riders.length > 0 ? (riders.reduce((sum, r) => sum + Number(r.rating || 0), 0) / riders.length).toFixed(1) : '0.0', color: '#ff9800' },
    { label: 'Background Checks Passed', value: riders.filter(r => r.background_check === 'passed').length, color: '#2196f3' },
    { label: 'Total Earnings', value: '₹' + (riders.reduce((sum, r) => sum + Number(r.total_earnings || 0), 0) / 100000).toFixed(1) + 'L', color: '#4caf50' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading verified riders...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Verified Riders</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>Riders with completed KYC verification and background checks</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRider}>Add Rider</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" sx={{ color: stat.color, mt: 1 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by rider name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rider Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Verified Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Background Check</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRiders.map((rider) => (
                  <TableRow key={rider._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{rider.rider_name}</TableCell>
                    <TableCell>{rider.phone}</TableCell>
                    <TableCell>
                      <Chip label={rider.vehicle_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>⭐ {rider.rating}</TableCell>
                    <TableCell>{rider.kyc_verified_date}</TableCell>
                    <TableCell>
                      <Chip label={rider.background_check} size="small" color={rider.background_check === 'passed' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(rider)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditRider(rider)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(rider)} title="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Verified Rider Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Rider Name</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.rider_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Phone</Typography>
                <Typography>{detailsDialog.data.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Email</Typography>
                <Typography>{detailsDialog.data.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Vehicle Type</Typography>
                <Chip label={detailsDialog.data.vehicle_type} size="small" sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>License Number</Typography>
                <Typography>{detailsDialog.data.license_number}</Typography>
              </Box>
              <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ KYC Verified</Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32', mt: 0.5 }}>Verified on {detailsDialog.data.kyc_verified_date}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Background Check</Typography>
                <Chip label={detailsDialog.data.background_check} size="small" color={detailsDialog.data.background_check === 'passed' ? 'success' : 'warning'} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Rating</Typography>
                <Typography sx={{ color: '#ff9800', fontWeight: 'bold' }}>⭐ {detailsDialog.data.rating}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Trips</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.total_trips}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Earnings</Typography>
                <Typography sx={{ color: '#4caf50', fontWeight: 'bold' }}>₹{detailsDialog.data.total_earnings}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Verified Rider Modal */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Add Verified Rider</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Rider Name" value={addDialog.data.rider_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, rider_name: e.target.value } })} fullWidth />
              <TextField label="Phone" value={addDialog.data.phone} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, phone: e.target.value } })} fullWidth />
              <TextField label="Email" value={addDialog.data.email} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, email: e.target.value } })} fullWidth />
              <TextField select label="Vehicle Type" value={addDialog.data.vehicle_type} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, vehicle_type: e.target.value } })} fullWidth>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
              </TextField>
              <TextField label="License Number" value={addDialog.data.license_number} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, license_number: e.target.value } })} fullWidth />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add Rider</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Verified Rider Modal */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Verified Rider</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Rider Name" value={editDialog.data.rider_name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, rider_name: e.target.value } })} fullWidth />
              <TextField label="Phone" value={editDialog.data.phone} disabled fullWidth />
              <TextField select label="Vehicle Type" value={editDialog.data.vehicle_type} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, vehicle_type: e.target.value } })} fullWidth>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Rider"
        description="This will remove the verified rider from the system. You can undo within 10 seconds."
        itemName={riderToDelete?.rider_name || 'Rider'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default RidersVerified;
