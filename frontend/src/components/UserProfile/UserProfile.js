import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  Analytics,
  Payment,
  Feedback,
  Email,
  Phone,
  LocationOn,
  Close,
  Send,
  Reply,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import EmailComposer from '../EmailComposer/EmailComposer';

function UserProfile({ user, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [replyText, setReplyText] = useState('');

  const orderAnalytics = [
    { month: 'Jan', orders: 4, amount: 2400 },
    { month: 'Feb', orders: 3, amount: 1800 },
    { month: 'Mar', orders: 6, amount: 3600 },
    { month: 'Apr', orders: 2, amount: 1200 },
    { month: 'May', orders: 5, amount: 3000 },
    { month: 'Jun', orders: 4, amount: 2400 },
  ];

  const mockPayments = [
    { id: 'PAY001', date: '2024-03-15', amount: 1200, method: 'UPI', status: 'completed' },
    { id: 'PAY002', date: '2024-03-10', amount: 800, method: 'Card', status: 'completed' },
    { id: 'PAY003', date: '2024-03-05', amount: 1500, method: 'COD', status: 'completed' },
  ];

  const mockFeedback = [
    { 
      id: 1, 
      date: '2024-03-15', 
      type: 'complaint', 
      subject: 'Late delivery', 
      message: 'My order was delivered 2 hours late. Very disappointed.',
      status: 'open',
      adminReply: null
    },
    { 
      id: 2, 
      date: '2024-03-10', 
      type: 'suggestion', 
      subject: 'App improvement', 
      message: 'Please add dark mode to the app.',
      status: 'resolved',
      adminReply: 'Thank you for the suggestion. We will consider this in our next update.'
    },
  ];

  const handleSendEmail = () => {
    console.log('Sending email to:', user.email);
    setEmailDialog(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleReplyFeedback = (feedbackId) => {
    console.log('Replying to feedback:', feedbackId);
    setReplyText('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          User Profile - {user.name}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, backgroundColor: 'primary.main' }}>
                {user.name.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={user.status} 
                  color={getStatusColor(user.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user.joinDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Email />}
                onClick={() => setEmailOpen(true)}
              >
                Send Email
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Person />} label="Details" />
            <Tab icon={<ShoppingBag />} label="Orders" />
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<Payment />} label="Payments" />
            <Tab icon={<Feedback />} label="Feedback" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Person sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Full Name" secondary={user.name} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Email" secondary={user.email} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Phone" secondary={user.phone} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Address" secondary={user.address} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Account Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Orders:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{user.orders}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Spent:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{user.totalSpent?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Account Status:</Typography>
                    <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Last Order:</Typography>
                    <Typography>{user.lastOrder ? new Date(user.lastOrder).toLocaleDateString() : 'N/A'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user.orderHistory?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {order.id}
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell>₹{order.amount}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>
                          <Chip label={order.status} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Order Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={orderAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Spending Pattern
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={orderAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Payment History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {payment.id}
                        </TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>₹{payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Chip label={payment.status} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mockFeedback.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {feedback.subject}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={feedback.type} 
                        color={feedback.type === 'complaint' ? 'error' : 'info'} 
                        size="small" 
                      />
                      <Chip 
                        label={feedback.status} 
                        color={feedback.status === 'open' ? 'warning' : 'success'} 
                        size="small" 
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(feedback.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {feedback.message}
                  </Typography>
                  
                  {feedback.adminReply && (
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Admin Reply:
                      </Typography>
                      <Typography variant="body2">
                        {feedback.adminReply}
                      </Typography>
                    </Paper>
                  )}
                  
                  {feedback.status === 'open' && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Reply />}
                        onClick={() => handleReplyFeedback(feedback.id)}
                      >
                        Reply
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </DialogContent>

      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Send Email to {user.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="To"
              value={user.email}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Type your message here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSendEmail}
            disabled={!emailSubject || !emailBody}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
      
      <EmailComposer
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipient={user}
        recipientType="user"
      />
    </Dialog>
  );
}

export default UserProfile;