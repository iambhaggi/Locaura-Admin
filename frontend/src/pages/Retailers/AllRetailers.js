import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { retailersAPI } from '../../services/apiService';


const AllRetailers = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [retailerToDelete, setRetailerToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedRetailer, setDeletedRetailer] = useState(null);

  const handleAddRetailer = () => {
    setAddDialog({
      open: true,
      data: {
        retailer_name: '',
        pan_card: '',
        email: '',
        phone: '',
        status: 'active',
        phone_verified: false,
        email_verified: false,
        otp: '',
        otp_expiry: '',
        fcm_token: '',
      }
    });
  };

  const handleEditRetailer = (retailer) => {
    setEditDialog({ open: true, data: { ...retailer } });
  };

  const handleViewDetails = (retailer) => {
    setDetailsDialog({ open: true, data: retailer });
  };

  const handleSaveNew = async () => {
    if (!addDialog.data?.retailer_name || !addDialog.data?.email || !addDialog.data?.phone) {
      alert('Please fill retailer name, email and phone');
      return;
    }

    try {
      setLoading(true);
      const response = await retailersAPI.create({
        retailer_name: addDialog.data.retailer_name,
        pan_card: addDialog.data.pan_card || '',
        email: addDialog.data.email,
        phone: addDialog.data.phone,
        phone_verified: Boolean(addDialog.data.phone_verified),
        email_verified: Boolean(addDialog.data.email_verified),
        otp: addDialog.data.otp || '',
        otp_expiry: addDialog.data.otp_expiry || null,
        fcm_token: addDialog.data.fcm_token || '',
      });

      const createdRetailer = response.data?.data || response.data;
      setRetailers([createdRetailer, ...retailers]);
      setAddDialog({ open: false, data: null });
      alert('Retailer added successfully');
    } catch (saveError) {
      alert(saveError.message || 'Failed to add retailer');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setRetailers(retailers.map(r => r._id === editDialog.data._id ? editDialog.data : r));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteRetailer = (retailer) => {
    setRetailerToDelete(retailer);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (retailerToDelete) {
      setDeletedRetailer(retailerToDelete);
      setIsDeleted(true);
      setRetailers(retailers.filter(r => r._id !== retailerToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedRetailer) {
      setRetailers([...retailers, deletedRetailer]);
      setDeleteDialog(false);
      setDeletedRetailer(null);
      setRetailerToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setRetailerToDelete(null);
    }
  };

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await retailersAPI.getAll({ limit: 1000 });
        const data = response.data?.data || response.data || [];
        setRetailers(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error('Error fetching retailers:', fetchError);
        setError('Failed to fetch retailers.');
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  const filteredRetailers = retailers.filter((retailer) => {
    const name = retailer.retailer_name || '';
    const phone = retailer.phone || '';
    const email = retailer.email || '';
    const pan = retailer.pan_card || '';

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Retailers', value: retailers.length, color: '#3f51b5' },
    { label: 'Phone Verified', value: retailers.filter(r => r.phone_verified).length, color: '#4caf50' },
    { label: 'Email Verified', value: retailers.filter(r => r.email_verified).length, color: '#2196f3' },
    { label: 'Active', value: retailers.filter(r => r.status === 'active').length, color: '#ff9800' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Retailers Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRetailer}>Add Retailer</Button>
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
            placeholder="Search by name, phone, email, or PAN..."
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

      {loading ? (
        <Alert severity="info">Loading retailers...</Alert>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>PAN Card</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRetailers.map((retailer) => (
                  <TableRow key={retailer._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{retailer.retailer_name}</TableCell>
                    <TableCell>{retailer.email}</TableCell>
                    <TableCell>{retailer.phone}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{retailer.pan_card}</TableCell>
                    <TableCell>
                      <Chip label={retailer.status} size="small" color={getStatusColor(retailer.status)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(retailer)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditRetailer(retailer)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteRetailer(retailer)} title="Delete">
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
      )}

      {/* View Details Modal */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Retailer Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Name</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.retailer_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Email</Typography>
                <Typography>{detailsDialog.data.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Phone</Typography>
                <Typography>{detailsDialog.data.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>PAN Card</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>{detailsDialog.data.pan_card}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                <Chip label={detailsDialog.data.status} color={getStatusColor(detailsDialog.data.status)} size="small" sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Phone Verified</Typography>
                <Chip label={detailsDialog.data.phone_verified ? 'Yes ✓' : 'No'} color={detailsDialog.data.phone_verified ? 'success' : 'warning'} size="small" sx={{ mt: 0.5 }} variant="outlined" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Email Verified</Typography>
                <Chip label={detailsDialog.data.email_verified ? 'Yes ✓' : 'No'} color={detailsDialog.data.email_verified ? 'success' : 'warning'} size="small" sx={{ mt: 0.5 }} variant="outlined" />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Joined</Typography>
                <Typography>{detailsDialog.data.createdAt}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add New Retailer Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Retailer</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Retailer Name" value={addDialog.data.retailer_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, retailer_name: e.target.value } })} fullWidth />
              <TextField label="Email" value={addDialog.data.email} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, email: e.target.value } })} fullWidth />
              <TextField label="Phone" value={addDialog.data.phone} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, phone: e.target.value } })} fullWidth />
              <TextField label="PAN Card" value={addDialog.data.pan_card} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, pan_card: e.target.value } })} fullWidth />
              <TextField label="OTP" value={addDialog.data.otp || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, otp: e.target.value } })} fullWidth />
              <TextField type="datetime-local" InputLabelProps={{ shrink: true }} label="OTP Expiry" value={addDialog.data.otp_expiry || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, otp_expiry: e.target.value } })} fullWidth />
              <TextField label="FCM Token" value={addDialog.data.fcm_token || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, fcm_token: e.target.value } })} fullWidth />
              <TextField select label="Status" value={addDialog.data.status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, status: e.target.value } })} fullWidth>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </TextField>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(addDialog.data.phone_verified)}
                    onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, phone_verified: e.target.checked } })}
                  />
                  {' '} Phone Verified
                </label>
              </Box>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(addDialog.data.email_verified)}
                    onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, email_verified: e.target.checked } })}
                  />
                  {' '} Email Verified
                </label>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add Retailer</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Retailer Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="md" fullWidth sx={{ maxHeight: '90vh' }}>
        <DialogTitle sx={{ background: '#FF6F00', color: 'white', fontWeight: 'bold' }}>
          ✏️ Edit Retailer Information - All Fields
        </DialogTitle>
        <DialogContent sx={{ mt: 2, maxHeight: 'calc(90vh - 140px)', overflow: 'auto' }}>
          {editDialog.data && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6F00', mb: 1 }}>👤 Personal Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Retailer Name" value={editDialog.data.retailer_name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, retailer_name: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" value={editDialog.data.email} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, email: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={editDialog.data.phone} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, phone: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="PAN Card" value={editDialog.data.pan_card} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, pan_card: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6F00', mb: 1, mt: 2 }}>✅ Status & Verification</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth label="Status" value={editDialog.data.status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, status: e.target.value } })} variant="outlined" size="small">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ mt: 1 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editDialog.data.phone_verified || false}
                      onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, phone_verified: e.target.checked } })}
                    />
                    {' '} Phone Verified
                  </label>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ mt: 1 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editDialog.data.email_verified || false}
                      onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, email_verified: e.target.checked } })}
                    />
                    {' '} Email Verified
                  </label>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditDialog({ open: false, data: null })} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ background: '#FF6F00' }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Retailer"
        description="This retailer will be deleted. You have 10 seconds to undo this action."
        itemName={retailerToDelete?.retailer_name || 'Retailer'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default AllRetailers;
