import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { ridersAPI } from '../../services/apiService';

const AllRiders = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedRider, setDeletedRider] = useState(null);

  useEffect(() => {
    const fetchRiders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ridersAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((rider) => ({
          ...rider,
          rider_name: rider.name || '-',
          license_number: rider.driving_license_number || '-',
          driving_license: rider.driving_license_number || '-',
          driving_license_expiry: rider.driving_license_expiry ? new Date(rider.driving_license_expiry).toISOString().split('T')[0] : '-',
          rating: Number(rider.average_rating || 0),
          total_trips: Number(rider.total_deliveries || 0),
          earnings_today: Math.round(Number(rider.total_earnings || 0) * 0.08),
          total_earnings: Number(rider.total_earnings || 0),
          kyc_status: rider.kyc_status || 'pending',
          vehicle_type: rider.vehicle_type || '-',
          vehicle_number: rider.vehicle_number || '-',
          email: rider.email || '-',
          name: rider.name || '-',
          phone: rider.phone || '-',
          status: rider.status || 'PENDING',
          is_online: Boolean(rider.is_online),
          average_rating: Number(rider.average_rating || 0),
          total_deliveries: Number(rider.total_deliveries || 0),
        }));
        setRiders(mapped);
      } catch (err) {
        setError('Failed to fetch riders');
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  const handleAddRider = () => {
    setAddDialog({ 
      open: true, 
      data: { 
        name: '', 
        phone: '', 
        email: '',
        vehicle_type: 'bike', 
        vehicle_number: '',
        vehicle_rc: '',
        profile_photo: '',
        date_of_birth: '',
        phone_verified: false,
        otp: '',
        otp_expiry: '',
        aadhaar_number: '',
        pan_number: '',
        kyc_status: 'pending', 
        status: 'PENDING',
        fcm_token: '',
        is_online: false,
        is_available: false,
        service_radius: 5,
        assigned_zones_json: '[]',
        driving_license: '',
        driving_license_expiry: '',
        bank_account_number: '',
        ifsc_code: '',
        upi_id: '',
        current_location_json: '{"type":"Point","coordinates":[0,0]}',
        average_rating: 0,
        total_deliveries: 0,
        total_earnings: 0,
        total_ratings: 0,
        cancellation_rate: 0,
        late_delivery_rate: 0,
        onboarded_at: '',
        last_active_at: '',
      }
    });
  };

  const handleEditRider = (rider) => {
    setEditDialog({ open: true, data: { ...rider } });
  };

  const handleViewDetails = (rider) => {
    setDetailsDialog({ open: true, data: rider });
  };

  const handleSaveNew = async () => {
    if (!addDialog.data?.name || !addDialog.data?.phone) {
      alert('Please fill rider name and phone');
      return;
    }

    try {
      setLoading(true);
      let parsedLocation = { type: 'Point', coordinates: [0, 0] };
      let parsedZones = [];
      try {
        parsedLocation = addDialog.data.current_location_json
          ? JSON.parse(addDialog.data.current_location_json)
          : { type: 'Point', coordinates: [0, 0] };
        parsedZones = addDialog.data.assigned_zones_json
          ? JSON.parse(addDialog.data.assigned_zones_json)
          : [];
      } catch (parseError) {
        alert('Current location or assigned zones JSON is invalid');
        return;
      }

      const response = await ridersAPI.create({
        ...addDialog.data,
        driving_license_number: addDialog.data.driving_license,
        current_location: parsedLocation,
        assigned_zones: Array.isArray(parsedZones) ? parsedZones : [],
      });
      const createdRider = response.data?.data || response.data;
      setRiders([createdRider, ...riders]);
      setAddDialog({ open: false, data: null });
      alert('Rider added successfully');
    } catch (saveError) {
      alert(saveError.message || 'Failed to add rider');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setRiders(riders.map(r => r._id === editDialog.data._id ? editDialog.data : r));
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
      setRiders(riders.filter(r => r._id !== riderToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedRider) {
      setRiders([...riders, deletedRider]);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Riders', value: riders.length, color: '#3f51b5' },
    { label: 'Online', value: riders.filter(r => r.is_online).length, color: '#4caf50' },
    { label: 'Verified', value: riders.filter(r => r.kyc_status === 'verified').length, color: '#2196f3' },
    { label: 'Avg Rating', value: riders.length > 0 ? (riders.reduce((sum, r) => sum + Number(r.average_rating || 0), 0) / riders.length).toFixed(2) : '0.00', color: '#ffc107' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading riders...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Delivery Partners Management</Typography>
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

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>KYC Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {riders.map((rider) => (
                  <TableRow key={rider._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{rider.name}</TableCell>
                    <TableCell>{rider.phone}</TableCell>
                    <TableCell>
                      <Chip label={rider.vehicle_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rider.kyc_status} 
                        size="small" 
                        color={rider.kyc_status === 'verified' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>⭐ {rider.average_rating}</TableCell>
                    <TableCell>
                      <Chip 
                        label={rider.status} 
                        size="small" 
                        color={getStatusColor(rider.status)}
                        variant="outlined"
                      />
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

      {/* View Details Modal - Shows Vehicle Information */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Delivery Partner Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Personal Information Section */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>👤 Personal Information</Typography>
                <Box sx={{ pl: 2, borderLeft: '3px solid #1976d2', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Name</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Email</Typography>
                    <Typography>{detailsDialog.data.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Phone</Typography>
                    <Typography sx={{ fontFamily: 'monospace' }}>{detailsDialog.data.phone}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Vehicle Information Section */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#f57c00' }}>🚗 Vehicle Information</Typography>
                <Box sx={{ pl: 2, borderLeft: '3px solid #f57c00', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Vehicle Type</Typography>
                    <Chip label={detailsDialog.data.vehicle_type} color="warning" variant="outlined" size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Vehicle Number</Typography>
                    <Typography sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{detailsDialog.data.vehicle_number}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Driving License</Typography>
                    <Typography sx={{ fontFamily: 'monospace' }}>{detailsDialog.data.driving_license}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>License Expiry</Typography>
                    <Typography sx={{ color: detailsDialog.data.driving_license_expiry < new Date().toISOString().split('T')[0] ? '#d32f2f' : '#2e7d32' }}>
                      {detailsDialog.data.driving_license_expiry}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Performance Information Section */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#388e3c' }}>📊 Performance</Typography>
                <Box sx={{ pl: 2, borderLeft: '3px solid #388e3c', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Total Deliveries</Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{detailsDialog.data.total_deliveries}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Rating</Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ffc107' }}>⭐ {detailsDialog.data.average_rating}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>Online Status</Typography>
                    <Chip 
                      label={detailsDialog.data.is_online ? 'Online' : 'Offline'} 
                      color={detailsDialog.data.is_online ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              {/* KYC Information Section */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#5e35b1' }}>✓ KYC Status</Typography>
                <Box sx={{ pl: 2, borderLeft: '3px solid #5e35b1', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Chip 
                    label={detailsDialog.data.kyc_status.toUpperCase()} 
                    color={detailsDialog.data.kyc_status === 'verified' ? 'success' : 'warning'}
                    sx={{ width: 'fit-content' }}
                  />
                  <Typography variant="caption" sx={{ color: '#666' }}>Status: {detailsDialog.data.status}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add New Rider Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Delivery Partner</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Name" value={addDialog.data.name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, name: e.target.value } })} fullWidth />
              <TextField label="Phone" value={addDialog.data.phone} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, phone: e.target.value } })} fullWidth />
              <TextField label="Email" value={addDialog.data.email} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, email: e.target.value } })} fullWidth />
              <TextField label="Profile Photo URL" value={addDialog.data.profile_photo || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, profile_photo: e.target.value } })} fullWidth />
              <TextField type="date" InputLabelProps={{ shrink: true }} label="Date of Birth" value={addDialog.data.date_of_birth || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, date_of_birth: e.target.value } })} fullWidth />
              <TextField select label="Vehicle Type" value={addDialog.data.vehicle_type} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, vehicle_type: e.target.value } })} fullWidth>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="cycle">Cycle</option>
              </TextField>
              <TextField label="Vehicle Number" value={addDialog.data.vehicle_number} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, vehicle_number: e.target.value } })} fullWidth />
              <TextField label="Vehicle RC" value={addDialog.data.vehicle_rc || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, vehicle_rc: e.target.value } })} fullWidth />
              <TextField label="Driving License" value={addDialog.data.driving_license} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, driving_license: e.target.value } })} fullWidth />
              <TextField label="License Expiry (YYYY-MM-DD)" value={addDialog.data.driving_license_expiry} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, driving_license_expiry: e.target.value } })} fullWidth />
              <TextField label="Aadhaar Number" value={addDialog.data.aadhaar_number || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, aadhaar_number: e.target.value } })} fullWidth />
              <TextField label="PAN Number" value={addDialog.data.pan_number || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, pan_number: e.target.value } })} fullWidth />
              <TextField label="OTP" value={addDialog.data.otp || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, otp: e.target.value } })} fullWidth />
              <TextField type="datetime-local" InputLabelProps={{ shrink: true }} label="OTP Expiry" value={addDialog.data.otp_expiry || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, otp_expiry: e.target.value } })} fullWidth />
              <TextField select label="KYC Status" value={addDialog.data.kyc_status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, kyc_status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </TextField>
              <TextField select label="Status" value={addDialog.data.status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, status: e.target.value } })} fullWidth>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </TextField>
              <TextField label="FCM Token" value={addDialog.data.fcm_token || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, fcm_token: e.target.value } })} fullWidth />
              <TextField label="Service Radius (km)" type="number" value={addDialog.data.service_radius || 5} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, service_radius: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Bank Account Number" value={addDialog.data.bank_account_number || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, bank_account_number: e.target.value } })} fullWidth />
              <TextField label="IFSC Code" value={addDialog.data.ifsc_code || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, ifsc_code: e.target.value } })} fullWidth />
              <TextField label="UPI ID" value={addDialog.data.upi_id || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, upi_id: e.target.value } })} fullWidth />
              <TextField label="Average Rating" type="number" inputProps={{ step: 0.1 }} value={addDialog.data.average_rating || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, average_rating: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Total Deliveries" type="number" value={addDialog.data.total_deliveries || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, total_deliveries: parseInt(e.target.value || '0', 10) } })} fullWidth />
              <TextField label="Total Earnings" type="number" value={addDialog.data.total_earnings || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, total_earnings: parseFloat(e.target.value || '0') } })} fullWidth />
              <TextField label="Total Ratings" type="number" value={addDialog.data.total_ratings || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, total_ratings: parseInt(e.target.value || '0', 10) } })} fullWidth />
              <TextField label="Cancellation Rate" type="number" inputProps={{ step: 0.01 }} value={addDialog.data.cancellation_rate || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, cancellation_rate: parseFloat(e.target.value || '0') } })} fullWidth />
              <TextField label="Late Delivery Rate" type="number" inputProps={{ step: 0.01 }} value={addDialog.data.late_delivery_rate || 0} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, late_delivery_rate: parseFloat(e.target.value || '0') } })} fullWidth />
              <TextField type="datetime-local" InputLabelProps={{ shrink: true }} label="Onboarded At" value={addDialog.data.onboarded_at || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, onboarded_at: e.target.value } })} fullWidth />
              <TextField type="datetime-local" InputLabelProps={{ shrink: true }} label="Last Active At" value={addDialog.data.last_active_at || ''} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, last_active_at: e.target.value } })} fullWidth />
              <TextField fullWidth multiline minRows={2} label="Current Location JSON" value={addDialog.data.current_location_json || '{"type":"Point","coordinates":[0,0]}' } onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, current_location_json: e.target.value } })} helperText='Example: {"type":"Point","coordinates":[72.8777,19.0760]}' />
              <TextField fullWidth multiline minRows={2} label="Assigned Zones JSON" value={addDialog.data.assigned_zones_json || '[]'} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, assigned_zones_json: e.target.value } })} helperText='Example: ["680f1d3d2f2e99a123456789"]' />
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
                    checked={Boolean(addDialog.data.is_online)}
                    onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, is_online: e.target.checked } })}
                  />
                  {' '} Is Online
                </label>
              </Box>
              <Box sx={{ mt: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(addDialog.data.is_available)}
                    onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, is_available: e.target.checked } })}
                  />
                  {' '} Is Available
                </label>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add Rider</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Rider Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="md" fullWidth sx={{ maxHeight: '90vh' }}>
        <DialogTitle sx={{ background: '#4CAF50', color: 'white', fontWeight: 'bold' }}>
          ✏️ Edit Delivery Partner Information - All Fields
        </DialogTitle>
        <DialogContent sx={{ mt: 2, maxHeight: 'calc(90vh - 140px)', overflow: 'auto' }}>
          {editDialog.data && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>👤 Personal Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Name" value={editDialog.data.name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, name: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={editDialog.data.phone} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, phone: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" value={editDialog.data.email} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, email: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1, mt: 2 }}>🚗 Vehicle Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Vehicle Type" value={editDialog.data.vehicle_type} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, vehicle_type: e.target.value } })} variant="outlined" size="small">
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="cycle">Cycle</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Vehicle Number" value={editDialog.data.vehicle_number} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, vehicle_number: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1, mt: 2 }}>📋 License Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Driving License" value={editDialog.data.driving_license} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, driving_license: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="License Expiry (YYYY-MM-DD)" value={editDialog.data.driving_license_expiry} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, driving_license_expiry: e.target.value } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1, mt: 2 }}>✅ Status & Verification</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth label="KYC Status" value={editDialog.data.kyc_status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, kyc_status: e.target.value } })} variant="outlined" size="small">
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </TextField>
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
                      checked={editDialog.data.is_online || false}
                      onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, is_online: e.target.checked } })}
                    />
                    {' '} Online
                  </label>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1, mt: 2 }}>📊 Performance Metrics</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Average Rating" type="number" inputProps={{ step: '0.1', min: '0', max: '5' }} value={editDialog.data.average_rating} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, average_rating: parseFloat(e.target.value) } })} variant="outlined" size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Total Deliveries" type="number" value={editDialog.data.total_deliveries} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, total_deliveries: parseInt(e.target.value) } })} variant="outlined" size="small" />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditDialog({ open: false, data: null })} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ background: '#4CAF50' }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Rider"
        description="This will remove the rider from the system. You can undo within 10 seconds."
        itemName={riderToDelete?.name || 'Rider'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default AllRiders;