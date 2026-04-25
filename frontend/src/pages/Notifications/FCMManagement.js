import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SendIcon from '@mui/icons-material/Send';
import { getNotificationStats } from '../../api/endpoints';

const FCMManagement = () => {
  const [serverKey, setServerKey] = useState('AIzaSyDjkXXX...XXX');
  const [senderId, setSenderId] = useState('123456789');
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [testToken, setTestToken] = useState('');
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testMessage, setTestMessage] = useState('This is a test notification');
  const [notificationStats, setNotificationStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  const fcmConfig = {
    projectId: 'locaura-admin-firebase',
    apiKey: 'AIzaSyDjkXXXXXXXXXXXXXXXXXXXXXXXXXX',
    authDomain: 'locaura-admin.firebaseapp.com',
    databaseURL: 'https://locaura-admin.firebaseio.com',
    storageBucket: 'locaura-admin.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456',
  };

  const recentNotifications = [];

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError('');
      try {
        const response = await getNotificationStats();
        setNotificationStats(response.data?.data || {});
      } catch (err) {
        console.error('Failed to load notification stats', err);
        setStatsError('Unable to load notification stats');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Notifications', value: notificationStats.total ?? 0, icon: SendIcon, color: '#1976d2' },
    { label: 'Unread', value: notificationStats.unread ?? 0, icon: ErrorIcon, color: '#d32f2f' },
    { label: 'Sent via FCM', value: notificationStats.sent_via_fcm ?? 0, icon: CloudIcon, color: '#f57c00' },
    { label: 'Riders', value: notificationStats.by_role?.rider ?? 0, icon: CheckCircleIcon, color: '#388e3c' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Firebase Cloud Messaging (FCM) Management
      </Typography>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure Firebase Cloud Messaging to send push notifications to mobile devices. All credentials are encrypted and stored securely.
      </Alert>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Icon sx={{ color: stat.color, fontSize: 32, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Configuration Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Firebase Configuration
              </Typography>

              <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  Project Configuration (Read-Only):
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(fcmConfig).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <TextField
                        fullWidth
                        size="small"
                        label={key}
                        value={value}
                        disabled
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Server Key"
                    value={serverKey}
                    onChange={(e) => setServerKey(e.target.value)}
                    type="password"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender ID"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary">
                  Save Configuration
                </Button>
                <Button variant="outlined" color="primary">
                  Test Connection
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Notification Settings
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Consumer Push Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Retailer Push Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Rider Push Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Order Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Payment Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Promotional Notifications"
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary">
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Notification */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Send Test Notification
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => setOpenTestDialog(true)}
                >
                  Send Test Message
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Notifications */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Recent Notifications
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead sx={{ background: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Message ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Recipients
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Success
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">
                        Failed
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Sent At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentNotifications.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{notif.id}</TableCell>
                        <TableCell>{notif.title}</TableCell>
                        <TableCell align="right">{notif.recipients}</TableCell>
                        <TableCell align="right" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                          {notif.success}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                          {notif.failed}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notif.status}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 'small' }}>{notif.sentAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Send Test Notification</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Device Token"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Paste FCM device token here"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Notification Title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
            />
            <TextField
              fullWidth
              label="Notification Message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenTestDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FCMManagement;
