import React, { useState } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import {
  Search,
  Delete,
  Edit,
  Add,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog/DeleteConfirmDialog';

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedUser, setDeletedUser] = useState(null);

  const handleAddUser = () => {
    setAddDialog({
      open: true,
      data: { name: '', email: '', phone: '', status: 'active', city: '', state: '', orders: 0 }
    });
  };

  const handleEditUser = (user) => {
    setEditDialog({ open: true, data: { ...user } });
  };

  const handleViewDetails = (user) => {
    setDetailsDialog({ open: true, data: user });
  };

  const handleSaveNew = () => {
    if (addDialog.data && addDialog.data.name) {
      setUsers([...users, { 
        ...addDialog.data, 
        _id: String(users.length + 1),
        joinDate: new Date().toISOString().split('T')[0]
      }]);
      setAddDialog({ open: false, data: null });
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setUsers(users.map(u => u._id === editDialog.data._id ? editDialog.data : u));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setDeletedUser(userToDelete);
      setIsDeleted(true);
      setUsers(users.filter(u => u._id !== userToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedUser) {
      setUsers([...users, deletedUser]);
      setDeleteDialog(false);
      setDeletedUser(null);
      setUserToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length, color: '#3f51b5' },
    { label: 'Active', value: users.filter(u => u.status === 'active').length, color: '#4caf50' },
    { label: 'Blocked', value: users.filter(u => u.status === 'blocked').length, color: '#f44336' },
    { label: 'Total Orders', value: users.reduce((sum, u) => sum + u.orders, 0), color: '#ff9800' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
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

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ backgroundColor: 'primary.main' }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ fontWeight: 600 }}
                          >
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {user._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.orders}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(user)} title="View">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditUser(user)} title="Edit">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(user)} title="Delete">
                        <Delete />
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>User Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                <Typography>{detailsDialog.data.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                <Chip label={detailsDialog.data.status} color={getStatusColor(detailsDialog.data.status)} size="small" sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Location</Typography>
                <Typography>{detailsDialog.data.city}, {detailsDialog.data.state}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Orders</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.orders}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Joined</Typography>
                <Typography>{new Date(detailsDialog.data.joinDate).toLocaleDateString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addDialog.data && (
            <>
              <TextField label="Name" value={addDialog.data.name} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, name: e.target.value } })} fullWidth />
              <TextField label="Email" value={addDialog.data.email} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, email: e.target.value } })} fullWidth />
              <TextField label="Phone" value={addDialog.data.phone} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, phone: e.target.value } })} fullWidth />
              <TextField label="City" value={addDialog.data.city} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, city: e.target.value } })} fullWidth />
              <TextField label="State" value={addDialog.data.state} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, state: e.target.value } })} fullWidth />
              <TextField select label="Status" value={addDialog.data.status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, status: e.target.value } })} fullWidth>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Name" value={editDialog.data.name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, name: e.target.value } })} fullWidth />
              <TextField label="Email" value={editDialog.data.email} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, email: e.target.value } })} fullWidth />
              <TextField label="Phone" value={editDialog.data.phone} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, phone: e.target.value } })} fullWidth />
              <TextField label="City" value={editDialog.data.city} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, city: e.target.value } })} fullWidth />
              <TextField label="State" value={editDialog.data.state} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, state: e.target.value } })} fullWidth />
              <TextField select label="Status" value={editDialog.data.status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, status: e.target.value } })} fullWidth>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
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
        title="Delete User"
        description="This will remove the user from the system. You can undo within 10 seconds."
        itemName={userToDelete?.name || 'User'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
}

export default Users;