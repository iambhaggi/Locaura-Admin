import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AlertTitle,
  Alert,
} from '@mui/material';
import {
  Edit,
  Delete,
  AddCircle,
  Download,
  LocalOffer,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import OfferComposer from '../components/OfferComposer/OfferComposer';
import Layout from '../components/Layout/Layout';

const Offers = () => {
  const [offerComposerOpen, setOfferComposerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    unread: 0,
    by_role: { consumer: 0, retailer: 0, rider: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [page, filterRole]);

  const API_BASE_URL_RAW = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const apiBaseUrl = API_BASE_URL_RAW.endsWith('/api')
    ? API_BASE_URL_RAW.replace(/\/+$/, '')
    : API_BASE_URL_RAW.replace(/\/+$/, '') + '/api';
  const authToken = localStorage.getItem('admin_token') || localStorage.getItem('token');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const query = filterRole !== 'all' ? `?recipient_role=${filterRole}&page=${page}` : `?page=${page}`;
      const response = await fetch(`${apiBaseUrl}/notifications${query}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/stats`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    // Delete logic here
    setDeleteConfirmOpen(false);
    setDeleteId(null);
    fetchNotifications();
  };

  const handleRefresh = () => {
    fetchNotifications();
    fetchStats();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'consumer':
        return '👥';
      case 'retailer':
        return '🏪';
      case 'rider':
        return '🏍️';
      default:
        return '📢';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalOffer sx={{ fontSize: 32, color: '#f5576c' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Offers & Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send special offers and notifications to users
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              onClick={() => setOfferComposerOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}
            >
              Send New Offer
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Sent
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  👥 Consumers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                  {stats.by_role?.consumer || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  🏪 Retailers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f5576c' }}>
                  {stats.by_role?.retailer || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  🏍️ Riders
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4facfe' }}>
                  {stats.by_role?.rider || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>ℹ️ How It Works</AlertTitle>
          Click "Send New Offer" to compose and send notifications with visual previews. You can preview exactly how your message appears on consumer, retailer, and rider mobile apps before sending.
        </Alert>

        {/* Notifications Table */}
        <Card>
          <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: '1px solid #e2e8f0' }}>
            <Chip
              label="All"
              variant={filterRole === 'all' ? 'filled' : 'outlined'}
              onClick={() => {
                setFilterRole('all');
                setPage(1);
              }}
              icon={<LocalOffer />}
            />
            <Chip
              label="Consumers"
              variant={filterRole === 'consumer' ? 'filled' : 'outlined'}
              onClick={() => {
                setFilterRole('consumer');
                setPage(1);
              }}
              color={filterRole === 'consumer' ? 'primary' : 'default'}
            />
            <Chip
              label="Retailers"
              variant={filterRole === 'retailer' ? 'filled' : 'outlined'}
              onClick={() => {
                setFilterRole('retailer');
                setPage(1);
              }}
              color={filterRole === 'retailer' ? 'primary' : 'default'}
            />
            <Chip
              label="Riders"
              variant={filterRole === 'rider' ? 'filled' : 'outlined'}
              onClick={() => {
                setFilterRole('rider');
                setPage(1);
              }}
              color={filterRole === 'rider' ? 'primary' : 'default'}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f8fafc' }}>
                  <TableCell>
                    <strong>Sent To</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Title</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Sent Date</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        No notifications sent yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{getRoleIcon(notification.recipient_role)}</span>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {notification.recipient_role}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {notification.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {notification.is_read ? (
                            <>
                              <VisibilityOff sx={{ fontSize: 16, color: '#999' }} />
                              <Chip label="Read" size="small" variant="filled" />
                            </>
                          ) : (
                            <>
                              <Visibility sx={{ fontSize: 16, color: '#667eea' }} />
                              <Chip label="Unread" size="small" color="primary" variant="filled" />
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteConfirm(notification._id)}
                          sx={{ color: '#f5576c' }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Delete Notification</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this notification?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Offer Composer Dialog */}
        <OfferComposer
          open={offerComposerOpen}
          onClose={() => {
            setOfferComposerOpen(false);
            handleRefresh();
          }}
        />
      </Box>
    </Layout>
  );
};

export default Offers;
