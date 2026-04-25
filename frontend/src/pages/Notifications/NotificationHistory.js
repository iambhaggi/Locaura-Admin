import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getNotifications } from '../../api/endpoints';
import Menu from '@mui/material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';

const NotificationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedNotification, setDeletedNotification] = useState(null);
  const [notificationsDataState, setNotificationsDataState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDateRange = (createdAt) => {
    const createdDate = new Date(createdAt);
    if (!createdAt || Number.isNaN(createdDate.getTime())) {
      return 'older';
    }
    const diffDays = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) return 'last-week';
    if (diffDays <= 30) return 'last-month';
    return 'older';
  };

  const historyData = notificationsDataState.map((notif) => ({
    ...notif,
    id: notif._id || notif.id,
    title: notif.title || '',
    message: notif.body || '',
    recipient: notif.recipient_id || notif.recipient_role || 'Unknown',
    type: notif.type || 'system',
    status: notif.is_read ? 'read' : 'unread',
    createdAt: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '',
    readAt: notif.is_read ? (notif.updatedAt ? new Date(notif.updatedAt).toLocaleString() : (notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '')) : null,
    dateRange: getDateRange(notif.createdAt),
  }));

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getNotifications({ limit: 100 });
        setNotificationsDataState(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load notification history', err);
        setError('Failed to load notification history');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = historyData.filter(
    (notif) =>
      (notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.recipient.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (dateFilter === 'all' || notif.dateRange === dateFilter)
  );

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDetail = (notification) => {
    setSelectedNotification(notification);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedNotification(null);
  };

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      setDeletedNotification(notificationToDelete);
      setIsDeleted(true);
    }
  };

  const handleUndoDelete = () => {
    if (deletedNotification) {
      setDeleteDialog(false);
      setDeletedNotification(null);
      setNotificationToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setNotificationToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Archived', value: historyData.length, color: '#1976d2' },
    { label: 'Last Week', value: historyData.filter((n) => n.dateRange === 'last-week').length, color: '#388e3c' },
    { label: 'Last Month', value: historyData.filter((n) => n.dateRange === 'last-month').length, color: '#f57c00' },
    { label: 'Older', value: historyData.filter((n) => n.dateRange === 'older').length, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Stats Cards */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading notification history...
        </Alert>
      )}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              placeholder="Search in history..."
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
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                label="Date Range"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="last-week">Last 7 Days</MenuItem>
                <MenuItem value="last-month">Last 30 Days</MenuItem>
                <MenuItem value="older">Older</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* History Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Recipient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sent At</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Read At</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotifications.map((notif) => (
              <TableRow key={notif.id} sx={{ '&:hover': { background: '#f5f5f5' }, opacity: 0.8 }}>
                <TableCell sx={{ fontWeight: 500 }}>{notif.title}</TableCell>
                <TableCell>{notif.recipient}</TableCell>
                <TableCell>
                  <Chip label={notif.type} variant="outlined" size="small" />
                </TableCell>
                <TableCell sx={{ fontSize: 'small' }}>{notif.createdAt}</TableCell>
                <TableCell sx={{ fontSize: 'small' }}>{notif.readAt || 'Not read'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, notif)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenDetail(selectedNotification);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Notification History Detail
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedNotification && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Title
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.title}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Message
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.message}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Type
                  </Typography>
                  <Chip label={selectedNotification.type} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Recipient
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.recipient}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Sent At
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.createdAt}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Read At
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.readAt || 'Never read'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Chip label={selectedNotification.status} size="small" />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Notification"
        description="This notification will be deleted. You have 10 seconds to undo this action."
        itemName={notificationToDelete?.title || 'Notification'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default NotificationHistory;
