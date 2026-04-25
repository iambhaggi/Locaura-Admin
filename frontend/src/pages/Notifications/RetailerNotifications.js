import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Button, Alert, Tabs, Tab,
} from '@mui/material';
import { Send as SendIcon, Search as SearchIcon, MoreVert as MoreVertIcon, Edit as EditIcon } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import { getNotifications } from '../../api/endpoints';

const RetailerNotifications = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({ recipient: '', subject: '', body: '' });
  const [openCompose, setOpenCompose] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [notificationsDataState, setNotificationsDataState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const retailerNotificationsData = notificationsDataState.map((notif) => ({
    ...notif,
    id: notif._id || notif.id,
    retailer: notif.recipient_id || notif.recipient_role || 'Retailer',
    title: notif.title || '',
    message: notif.body || '',
    type: notif.type || 'system',
    status: notif.is_read ? 'read' : 'unread',
    createdAt: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '',
  }));

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getNotifications({ recipient_role: 'retailer', limit: 100 });
        setNotificationsDataState(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load retailer notifications', err);
        setError('Failed to load retailer notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);


  // Email Templates
  const emailTemplates = {
    order_received: {
      name: '📦 New Order Received',
      subject: 'New Order Received! 📦',
      body: `Hi [RETAILER_NAME],

You have received a new order!

📋 Order Details:
- Order ID: [ORDER_ID]
- Items: [ITEMS_COUNT]
- Total Amount: ₹[ORDER_AMOUNT]
- Customer: [CUSTOMER_NAME]

Please prepare and pack asap.

Best regards,
Locaura Team`
    },
    payment_received: {
      name: '💳 Payment Received',
      subject: 'Payment Received! 💳',
      body: `Hi [RETAILER_NAME],

Payment processed successfully.

💰 Details:
- Settlement ID: [SETTLEMENT_ID]
- Amount: ₹[AMOUNT]
- Net (after commission): ₹[NET_AMOUNT]

Thank you for your partnership!
Locaura Team`
    },
    low_inventory: {
      name: '⚠️ Low Stock Alert',
      subject: 'Low Stock Alert ⚠️',
      body: `Hi [RETAILER_NAME],

Some products have low inventory.

📦 Low Stock Items:
[LOW_STOCK_ITEMS]

Please restock soon.

Best regards,
Locaura Team`
    },
    performance_alert: {
      name: '📊 Performance Alert',
      subject: 'Store Performance Update 📊',
      body: `Hi [RETAILER_NAME],

Your store performance metrics:

📈 Details:
- Current Rating: [RATING]
- Total Orders: [TOTAL_ORDERS]
- Fulfillment Rate: [FULFILLMENT_RATE]%
- Average Response Time: [RESPONSE_TIME] hours

Maintain quality to improve visibility!

Best regards,
Locaura Team`
    },
  };

  const filteredNotifications = retailerNotificationsData.filter(
    (notif) =>
      ((notif.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notif.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notif.retailer || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === 'all' || (notif.type || 'system') === typeFilter)
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

  const handleSelectTemplate = (templateKey) => {
    const template = emailTemplates[templateKey];
    setFormData({
      recipient: '',
      subject: template.subject,
      body: template.body
    });
    setOpenTemplates(false);
  };

  const handleSend = () => {
    if (!formData.recipient || !formData.subject || !formData.body) {
      alert('Please fill all fields');
      return;
    }
    alert(`Notification sent to ${formData.recipient}!`);
    setFormData({ recipient: '', subject: '', body: '' });
    setOpenCompose(false);
  };

  const stats = [
    { label: 'Total Notifications', value: retailerNotificationsData.length, color: '#1976d2' },
    { label: 'Unread', value: retailerNotificationsData.filter((n) => n.status === 'unread').length, color: '#d32f2f' },
    { label: 'This Week', value: 0, color: '#388e3c' },
    { label: 'Templates', value: Object.keys(emailTemplates).length, color: '#f57c00' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="📋 Notifications" />
          <Tab label="✉️ Send Notification" />
        </Tabs>
      </Box>

      {tabValue === 0 ? (
        <>
          {/* Stats Cards */}
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
                  placeholder="Search by retailer name..."
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
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="order">Order</MenuItem>
                    <MenuItem value="payment">Payment</MenuItem>
                    <MenuItem value="inventory">Inventory</MenuItem>
                    <MenuItem value="verification">Verification</MenuItem>
                    <MenuItem value="performance">Performance</MenuItem>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Retailer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notif) => (
                  <TableRow key={notif.id} sx={{ '&:hover': { background: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{notif.retailer}</TableCell>
                    <TableCell>{notif.title}</TableCell>
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
              Retailer Notification
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
                        Retailer
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {selectedNotification.retailer}
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
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Type
                      </Typography>
                      <Chip label={selectedNotification.type} size="small" />
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
        </>
      ) : (
        <>
          {/* Compose Notification Tab */}
          <Paper sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenTemplates(!openTemplates)}
                  sx={{ mb: 2 }}
                >
                  Load Template
                </Button>

                {openTemplates && (
                  <Box sx={{ mb: 3, p: 2, background: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Select a Template:
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(emailTemplates).map(([key, template]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleSelectTemplate(key)}
                            sx={{
                              background: '#FF9800',
                              color: 'white',
                              py: 1.5,
                              '&:hover': { background: '#F57C00' }
                            }}
                          >
                            {template.name}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recipient (Email or Retailer ID)"
                  placeholder="retailer@example.com or RID-001"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notification Body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  multiline
                  rows={8}
                  placeholder="Enter your notification message..."
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  💡 Use placeholders like [RETAILER_NAME], [ORDER_ID], [AMOUNT] in templates to personalize messages.
                </Alert>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setFormData({ recipient: '', subject: '', body: '' })}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSend}
                  sx={{ background: '#FF9800' }}
                >
                  Send Notification
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default RetailerNotifications;
