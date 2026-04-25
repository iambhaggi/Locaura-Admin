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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { storesAPI } from '../../services/apiService';

const StoreBusinessHours = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedStore, setDeletedStore] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await storesAPI.getAll();
        const data = response?.data?.data || response?.data || [];
        const mapped = data.map((store) => ({
          _id: store._id,
          store_name: store.store_name || '-',
          business_hours: Array.isArray(store.business_hours) ? store.business_hours : [],
          holidays: Array.isArray(store.holidays) ? store.holidays : [],
          last_updated: store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : '-',
        }));
        setStores(mapped);
      } catch (err) {
        setError('Failed to fetch store business hours');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleAddStore = () => {
    setAddDialog({
      open: true,
      data: {
        store_name: '',
        business_hours: Array(7).fill(null).map((_, i) => ({
          day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
          open: '09:00',
          close: '20:00',
          is_closed: false,
        })),
        holidays: [],
      }
    });
  };

  const handleEditStore = (store) => {
    setEditDialog({ open: true, data: { ...store } });
  };

  const handleViewDetails = (store) => {
    setDetailsDialog({ open: true, data: store });
  };

  const handleSaveNew = () => {
    if (addDialog.data && addDialog.data.store_name) {
      setStores([...stores, {
        ...addDialog.data,
        _id: 'store_' + Math.random().toString(36).substr(2, 9),
        last_updated: new Date().toISOString().split('T')[0]
      }]);
      setAddDialog({ open: false, data: null });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setStores(stores.map(s => s._id === editDialog.data._id ? editDialog.data : s));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteStore = (store) => {
    setStoreToDelete(store);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (storeToDelete) {
      setDeletedStore(storeToDelete);
      setIsDeleted(true);
      setStores(stores.filter(s => s._id !== storeToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedStore) {
      setStores([...stores, deletedStore]);
      setDeleteDialog(false);
      setDeletedStore(null);
      setStoreToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setStoreToDelete(null);
    }
  };

  const filteredStores = stores.filter((store) =>
    (store.store_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const stats = [
    { label: 'Total Stores', value: stores.length, color: '#3f51b5' },
    { label: 'Open Now', value: stores.filter((s) => (s.business_hours || []).some((h) => (h.day || '').toLowerCase() === currentDay && !h.is_closed)).length, color: '#4caf50' },
    { label: 'Stores with Hours Set', value: stores.filter((s) => (s.business_hours || []).length > 0).length, color: '#ff9800' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Store Business Hours</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStore}>Add Store Hours</Button>
      </Box>

      {loading && <Typography sx={{ mb: 2 }}>Loading business hours...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
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
            placeholder="Search by store name..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Weekday Hours</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Weekend Hours</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Holidays</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStores.map((store) => {
                  const weekdayHours = (store.business_hours || []).find((h) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes((h.day || '').toLowerCase()));
                  const saturdayHours = (store.business_hours || []).find((h) => (h.day || '').toLowerCase() === 'saturday');
                  return (
                    <TableRow key={store._id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{store.store_name}</TableCell>
                      <TableCell>{weekdayHours ? (weekdayHours.is_closed ? 'Closed' : `${weekdayHours.open} - ${weekdayHours.close}`) : '-'}</TableCell>
                      <TableCell>{saturdayHours ? (saturdayHours.is_closed ? 'Closed' : `${saturdayHours.open} - ${saturdayHours.close}`) : '-'}</TableCell>
                      <TableCell>
                        <Chip label={(store.holidays || []).length} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="info" onClick={() => handleViewDetails(store)} title="View Details">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => handleEditStore(store)} title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteStore(store)} title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!loading && filteredStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No stores found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Business Hours Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Store Name</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.store_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Weekly Hours</Typography>
                {(detailsDialog.data.business_hours || []).map((hour, idx) => (
                  <Box key={idx} sx={{ fontSize: '0.9rem', ml: 1 }}>
                    <strong>{hour.day}:</strong> {hour.is_closed ? 'Closed' : `${hour.open} - ${hour.close}`}
                  </Box>
                ))}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Holidays</Typography>
                <Typography>{(detailsDialog.data.holidays || []).length > 0 ? detailsDialog.data.holidays.join(', ') : 'None'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Last Updated</Typography>
                <Typography>{detailsDialog.data.last_updated}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Store Hours Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>Add Store Business Hours</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Store Name" value={addDialog.data.store_name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, store_name: e.target.value } })} fullWidth />
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Operating Hours by Day</Typography>
              {addDialog.data.business_hours.map((hour, idx) => (
                <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, alignItems: 'center' }}>
                  <TextField value={hour.day} disabled size="small" />
                  <TextField type="time" value={hour.open} onChange={(e) => {
                    const newHours = [...addDialog.data.business_hours];
                    newHours[idx].open = e.target.value;
                    setAddDialog({ ...addDialog, data: { ...addDialog.data, business_hours: newHours } });
                  }} size="small" />
                  <TextField type="time" value={hour.close} onChange={(e) => {
                    const newHours = [...addDialog.data.business_hours];
                    newHours[idx].close = e.target.value;
                    setAddDialog({ ...addDialog, data: { ...addDialog.data, business_hours: newHours } });
                  }} size="small" />
                  <FormControlLabel control={<Switch checked={hour.is_closed} onChange={(e) => {
                    const newHours = [...addDialog.data.business_hours];
                    newHours[idx].is_closed = e.target.checked;
                    setAddDialog({ ...addDialog, data: { ...addDialog.data, business_hours: newHours } });
                  }} />} label="Closed" />
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Save Hours</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Store Hours Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>Edit Business Hours</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Store Name" value={editDialog.data.store_name} disabled fullWidth />
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Operating Hours by Day</Typography>
              {editDialog.data.business_hours.map((hour, idx) => (
                <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, alignItems: 'center' }}>
                  <TextField value={hour.day} disabled size="small" />
                  <TextField type="time" value={hour.open} onChange={(e) => {
                    const newHours = [...editDialog.data.business_hours];
                    newHours[idx].open = e.target.value;
                    setEditDialog({ ...editDialog, data: { ...editDialog.data, business_hours: newHours } });
                  }} size="small" />
                  <TextField type="time" value={hour.close} onChange={(e) => {
                    const newHours = [...editDialog.data.business_hours];
                    newHours[idx].close = e.target.value;
                    setEditDialog({ ...editDialog, data: { ...editDialog.data, business_hours: newHours } });
                  }} size="small" />
                  <FormControlLabel control={<Switch checked={hour.is_closed} onChange={(e) => {
                    const newHours = [...editDialog.data.business_hours];
                    newHours[idx].is_closed = e.target.checked;
                    setEditDialog({ ...editDialog, data: { ...editDialog.data, business_hours: newHours } });
                  }} />} label="Closed" />
                </Box>
              ))}
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
        title="Delete Store"
        description="This store will be deleted. You have 10 seconds to undo this action."
        itemName={storeToDelete?.store_name || 'Store'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default StoreBusinessHours;
