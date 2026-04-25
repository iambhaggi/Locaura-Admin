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
  DialogActions,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from '@mui/material';
import { getNotifications } from '../../api/endpoints';
import { Search as SearchIcon, MoreVert as MoreVertIcon, Send as SendIcon, Edit as EditIcon } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReviewsIcon from '@mui/icons-material/Reviews';

const ConsumerNotifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCompose, setOpenCompose] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({ recipient: '', subject: '', body: '' });
  const [notificationsDataState, setNotificationsDataState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const consumerNotificationsData = notificationsDataState.map((notif) => ({
    ...notif,
    id: notif._id || notif.id,
    consumer: notif.recipient_id || notif.recipient_role || 'Consumer',
    title: notif.title || '',
    message: notif.body || '',
    type: notif.type || 'system',
    status: notif.is_read ? 'read' : 'unread',
    orderId: notif.data?.order_id || notif.data?.orderId || '-',
    createdAt: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '',
  }));

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getNotifications({ recipient_role: 'consumer', limit: 100 });
        setNotificationsDataState(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load consumer notifications', err);
        setError('Failed to load consumer notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Email Templates
  const emailTemplates = {
    order_confirmed: {
      subject: 'Your Order is Confirmed! 📦',
      body: `Hi [CUSTOMER_NAME],

Thank you for your order! We're excited to prepare your items.

📋 Order Details:
- Order ID: [ORDER_ID]
- Order Amount: ₹[ORDER_AMOUNT]
- Estimated Delivery: [DELIVERY_DATE]

Your items will be picked and packed by our store soon. You'll receive a notification once it's on its way.

Thank you for shopping with Locaura!

Best regards,
Locaura Team`
    },
    delivery_update: {
      subject: 'Your Order is on the Way! 🚚',
      body: `Hi [CUSTOMER_NAME],

Great news! Your order [ORDER_ID] is on its way to you.

🎯 Tracking Details:
- Rider: [RIDER_NAME]
- Contact: [RIDER_PHONE]
- Estimated Arrival: [ARRIVAL_TIME]

You can track your order in real-time using our app.

Thank you for your patience!
Locaura Team`
    },
    order_delivered: {
      subject: 'Order Delivered Successfully! ✅',
      body: `Hi [CUSTOMER_NAME],

Your order [ORDER_ID] has been delivered successfully!

📦 Items Received:
[ITEMS_LIST]

Please rate your experience and help us improve. Your feedback is valuable!

Best regards,
Locaura Team`
    },
    refund_processed: {
      subject: 'Refund Processed Successfully! 💳',
      body: `Hi [CUSTOMER_NAME],

Your refund has been processed successfully.

💰 Refund Details:
- Order ID: [ORDER_ID]
- Refund Amount: ₹[REFUND_AMOUNT]
- Refund Method: [REFUND_METHOD]
- Processing Time: [PROCESSING_TIME]

The amount will be reflected in your account within 5-7 business days.

If you have questions, contact our support team.

Best regards,
Locaura Team`
    },
    review_request: {
      subject: 'Share Your Experience! ⭐',
      body: `Hi [CUSTOMER_NAME],

We'd love to hear about your experience with the products from order [ORDER_ID].

Your review helps other customers make better choices. Please share your feedback:
- Product Quality
- Delivery Experience
- Customer Service

[Review Link]

Thank you!
Locaura Team`
    },
    promo_offer: {
      subject: 'Exclusive Offer Just For You! 🎉',
      body: `Hi [CUSTOMER_NAME],

We have a special offer just for you!

🎁 [OFFER_DESCRIPTION]
- Promo Code: [PROMO_CODE]
- Valid Until: [EXPIRY_DATE]
- Minimum Order: ₹[MIN_ORDER]

Shop now and save more!

Happy shopping!
Locaura Team`
    },
    cart_reminder: {
      subject: 'You Left Items in Your Cart! 🛒',
      body: `Hi [CUSTOMER_NAME],

We noticed you left some items in your cart. Don't miss out!

📝 Items in Cart:
[CART_ITEMS]

Total Value: ₹[TOTAL_AMOUNT]

Complete your purchase now and get them delivered quickly.

[Cart Link]

Best regards,
Locaura Team`
    }
  };

  const filteredNotifications = consumerNotificationsData.filter(n => 
    ((n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
     (n.consumer || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter === 'all' || (n.type || 'system') === typeFilter)
  );

  const handleMenuOpen = (e, notif) => { setAnchorEl(e.currentTarget); setSelectedNotification(notif); };
  const handleMenuClose = () => setAnchorEl(null);
  const handleOpenDetail = (notif) => { setSelectedNotification(notif); setOpenDetail(true); handleMenuClose(); };
  const handleCloseDetail = () => { setOpenDetail(false); setSelectedNotification(null); };

  const handleSelectTemplate = (templateId) => {
    const template = emailTemplates[templateId];
    setFormData({ ...formData, subject: template.subject, body: template.body });
    setOpenTemplates(false);
  };

  const handleComposeSend = () => {
    if (!formData.recipient || !formData.subject || !formData.body) {
      alert('Please fill all fields');
      return;
    }
    alert('Message sent successfully to ' + formData.recipient);
    setFormData({ recipient: '', subject: '', body: '' });
    setOpenCompose(false);
  };

  const stats = [
    { label: 'Total Sent', value: consumerNotificationsData.length, bg: '#e3f2fd', color: '#1976d2' },
    { label: 'Unread', value: consumerNotificationsData.filter(n => n.status === 'unread').length, bg: '#fff3e0', color: '#ff9800' },
    { label: 'Delivery', value: consumerNotificationsData.filter(n => n.type === 'delivery').length, bg: '#e8f5e9', color: '#4caf50' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>📱 Consumer Notifications</Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>Send notifications and emails to consumers</Typography>
        </Box>
        <Button variant="contained" startIcon={<SendIcon />} onClick={() => setOpenCompose(true)} sx={{ background: '#2196F3' }}>
          Send Notification
        </Button>
      </Box>

      {/* Stats */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading consumer notifications...
        </Alert>
      )}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ backgroundColor: stat.bg }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#999' }}>{stat.label}</Typography>
                <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold', mt: 1 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField fullWidth placeholder="Search by consumer or order..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="review">Review</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotifications.map(notif => (
              <TableRow key={notif.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{notif.consumer}</TableCell>
                <TableCell>{notif.title}</TableCell>
                <TableCell><Chip label={notif.type} size="small" variant="outlined" /></TableCell>
                <TableCell>{notif.orderId || '-'}</TableCell>
                <TableCell>
                  <Chip label={notif.status} color={notif.status === 'unread' ? 'error' : 'default'} size="small" />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, notif)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedNotification)}>👁️ View Details</MenuItem>
        <MenuItem>✏️ Edit</MenuItem>
        <MenuItem>🗑️ Delete</MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>Notification Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedNotification && (
            <Box>
              <Typography variant="caption" sx={{ color: '#999' }}>Consumer</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{selectedNotification.consumer}</Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>Title</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>{selectedNotification.title}</Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>Message</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedNotification.message}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog open={openCompose} onClose={() => setOpenCompose(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: '#2196F3', color: 'white', fontWeight: 'bold' }}>✉️ Compose Notification</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>Use pre-defined templates or write custom messages. Variables like [CUSTOMER_NAME] will be auto-filled.</Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button fullWidth variant="outlined" onClick={() => setOpenTemplates(true)}>Select Email Template</Button>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Recipient Email(s)" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={6} label="Message Body" value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCompose(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleComposeSend} sx={{ background: '#2196F3' }}>Send</Button>
        </DialogActions>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={openTemplates} onClose={() => setOpenTemplates(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: '#FF9800', color: 'white', fontWeight: 'bold' }}>📧 Email Templates</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={1}>
            {Object.entries(emailTemplates).map(([key, template]) => (
              <Grid item xs={12} key={key}>
                <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={() => handleSelectTemplate(key)}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{template.subject}</Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>Click to use this template</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ConsumerNotifications;
