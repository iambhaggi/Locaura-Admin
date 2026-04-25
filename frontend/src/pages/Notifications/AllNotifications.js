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
import Menu from '@mui/material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { getNotifications } from '../../api/endpoints';

const AllNotifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsDataState, setNotificationsDataState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const notificationsData = notificationsDataState.map((notif) => ({
    ...notif,
    id: notif._id || notif.id,
    title: notif.title || '',
    message: notif.body || '',
    recipient: notif.recipient_id ? String(notif.recipient_id) : notif.recipient_role || 'Unknown',
    recipientType: notif.recipient_role || 'Unknown',
    type: notif.type ? String(notif.type).toLowerCase() : 'system',
    status: notif.is_read ? 'read' : 'unread',
    priority: notif.data?.priority || 'normal',
    imageUrl: notif.data?.image_url || notif.data?.image || '',
    createdAt: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '',
  }));

  const getRecipient = (notif) => notif.recipient || notif.recipient_role || 'Unknown';

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getNotifications({ limit: 100 });
        setNotificationsDataState(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load notifications', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notificationsData.filter(
    (notif) =>
      ((notif.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notif.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRecipient(notif).toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === 'all' || (notif.type || 'system') === typeFilter) &&
      (statusFilter === 'all' || (notif.status || 'unread') === statusFilter)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'read':
        return 'default';
      case 'unread':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#d32f2f';
      case 'normal':
        return '#1976d2';
      case 'low':
        return '#388e3c';
      default:
        return '#1976d2';
    }
  };

  const getIcon = (icon) => {
    switch (icon) {
      case 'error':
        return <ErrorIcon sx={{ color: '#d32f2f' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#f57c00' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: '#388e3c' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#1976d2' }} />;
    }
  };

  const stats = [
    { label: 'Total Notifications', value: notificationsData.length, color: '#1976d2' },
    { label: 'Unread', value: notificationsData.filter((n) => n.status === 'unread').length, color: '#d32f2f' },
    { label: 'High Priority', value: notificationsData.filter((n) => n.priority === 'high').length, color: '#f57c00' },
    { label: 'Today', value: notificationsData.filter((n) => n.createdAt.includes('2025-04-09')).length, color: '#388e3c' },
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
          Loading notifications...
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search notification title or message..."
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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="order">Order</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="approval">Approval</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Icon</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Recipient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotifications.map((notif) => (
              <TableRow key={notif.id} sx={{ '&:hover': { background: '#f5f5f5' } }}>
                <TableCell>{getIcon(notif.icon)}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{notif.title}</TableCell>
                <TableCell>{notif.recipient}</TableCell>
                <TableCell>
                  <Chip label={notif.type} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={notif.status}
                    color={notif.status === 'unread' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={notif.priority}
                    size="small"
                    sx={{
                      background: getPriorityColor(notif.priority),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>{notif.createdAt}</TableCell>
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
        <MenuItem>Mark as Read</MenuItem>
        <MenuItem>Delete</MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Notification Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedNotification && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Notification ID
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.id}
                  </Typography>
                </Grid>
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
                {selectedNotification.imageUrl && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Image
                    </Typography>
                    <Box
                      component="img"
                      src={selectedNotification.imageUrl}
                      alt="Notification"
                      sx={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 2, mt: 1 }}
                    />
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Type
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedNotification.status}
                    color={selectedNotification.status === 'unread' ? 'error' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedNotification.priority}
                    size="small"
                    sx={{
                      background: getPriorityColor(selectedNotification.priority),
                      color: 'white',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Recipient Type
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedNotification.recipientType}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
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
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AllNotifications;
