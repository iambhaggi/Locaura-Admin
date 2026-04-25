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
  Divider,
  Badge,
} from '@mui/material';
import {
  Person,
  Schedule,
  LocalShipping,
  Payment,
  Analytics,
  Feedback,
  Chat,
  Email,
  Phone,
  LocationOn,
  Close,
  Send,
  Reply,
  DirectionsCar,
  AccessTime,
  TrendingUp,
  AccountBalance,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import EmailComposer from '../EmailComposer/EmailComposer';

function DeliveryPartnerProfile({ partner, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  // Mock login/logout data
  const mockLoginData = [
    { date: '2024-03-15', loginTime: '08:30 AM', logoutTime: '06:45 PM', hoursWorked: 10.25, status: 'completed' },
    { date: '2024-03-14', loginTime: '09:00 AM', logoutTime: '07:30 PM', hoursWorked: 10.5, status: 'completed' },
    { date: '2024-03-13', loginTime: '08:45 AM', logoutTime: '06:15 PM', hoursWorked: 9.5, status: 'completed' },
    { date: '2024-03-12', loginTime: '09:15 AM', logoutTime: '05:30 PM', hoursWorked: 8.25, status: 'early_logout' },
  ];

  // Mock delivery data
  const mockDeliveries = [
    { 
      id: 'DEL001', 
      orderId: '#ORD001', 
      customer: 'John Doe', 
      retailer: 'Fresh Mart',
      pickupTime: '10:30 AM',
      deliveryTime: '11:15 AM',
      distance: '3.2 km',
      earnings: 45,
      status: 'delivered',
      date: '2024-03-15'
    },
    { 
      id: 'DEL002', 
      orderId: '#ORD002', 
      customer: 'Jane Smith', 
      retailer: 'Tech Store',
      pickupTime: '02:15 PM',
      deliveryTime: '02:50 PM',
      distance: '2.8 km',
      earnings: 40,
      status: 'delivered',
      date: '2024-03-15'
    },
  ];

  // Mock payment data
  const mockPayments = [
    { id: 'PAY001', date: '2024-03-15', amount: 850, deliveries: 18, bonus: 50, status: 'completed' },
    { id: 'PAY002', date: '2024-03-10', amount: 720, deliveries: 15, bonus: 20, status: 'completed' },
    { id: 'PAY003', date: '2024-03-05', amount: 960, deliveries: 22, bonus: 80, status: 'pending' },
  ];

  // Mock earnings analytics
  const earningsAnalytics = [
    { day: 'Mon', earnings: 450, deliveries: 12, hours: 8.5 },
    { day: 'Tue', earnings: 520, deliveries: 14, hours: 9.2 },
    { day: 'Wed', earnings: 380, deliveries: 10, hours: 7.8 },
    { day: 'Thu', earnings: 610, deliveries: 16, hours: 10.1 },
    { day: 'Fri', earnings: 580, deliveries: 15, hours: 9.5 },
    { day: 'Sat', earnings: 720, deliveries: 20, hours: 11.2 },
    { day: 'Sun', earnings: 490, deliveries: 13, hours: 8.9 },
  ];

  // Mock feedback data
  const mockFeedback = [
    {
      id: 1,
      date: '2024-03-15',
      type: 'complaint',
      subject: 'Late delivery issue',
      message: 'I was stuck in traffic and delivery got delayed. Need better route planning.',
      status: 'open',
      adminReply: null
    },
    {
      id: 2,
      date: '2024-03-10',
      type: 'suggestion',
      subject: 'App improvement',
      message: 'Can we have better GPS navigation in the delivery app?',
      status: 'resolved',
      adminReply: 'Thank you for the feedback. We are working on GPS improvements.'
    },
  ];

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'admin', message: 'Hi! How is your delivery going today?', time: '10:30 AM' },
    { id: 2, sender: 'partner', message: 'Good morning! All deliveries on time so far.', time: '10:32 AM' },
    { id: 3, sender: 'admin', message: 'Great! Let me know if you need any support.', time: '10:35 AM' },
  ]);

  const handleSendEmail = () => {
    console.log('Sending email to delivery partner');
    setEmailDialog(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'admin',
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!partner) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Delivery Partner Profile - {partner.name}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, backgroundColor: 'warning.main' }}>
                <LocalShipping sx={{ fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {partner.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {partner.email} • {partner.phone}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={partner.status} 
                  color={getStatusColor(partner.status)}
                  size="small"
                />
                <Chip label={partner.vehicleType} variant="outlined" size="small" />
                <Typography variant="body2" color="text.secondary">
                  ⭐ {partner.rating}/5.0 • {partner.deliveries} deliveries
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Email />}
                onClick={() => setEmailOpen(true)}
                sx={{ mr: 1 }}
              >
                Send Email
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Person />} label="Details" />
            <Tab icon={<Schedule />} label="Login Times" />
            <Tab icon={<LocalShipping />} label="Deliveries" />
            <Tab icon={<Payment />} label="Payments" />
            <Tab icon={<Analytics />} label="Earnings" />
            <Tab icon={<Feedback />} label="Feedback" />
            <Tab 
              icon={
                <Badge badgeContent={2} color="error">
                  <Chat />
                </Badge>
              } 
              label="Chat" 
            />
          </Tabs>
        </Box>

        {/* Details Tab */}
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
                      <ListItemText primary="Full Name" secondary={partner.name} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Email" secondary={partner.email || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Phone" secondary={partner.phone} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Date of Birth:</Typography>
                      <ListItemText primary="Date of Birth" secondary={partner.date_of_birth ? new Date(partner.date_of_birth).toLocaleDateString() : 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Phone Verified:</Typography>
                      <ListItemText primary="Phone Verified" secondary={partner.phone_verified ? 'Yes' : 'No'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <DirectionsCar sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Vehicle" secondary={`${partner.vehicle_type || 'N/A'} - ${partner.vehicle_number || 'N/A'}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>KYC Status:</Typography>
                      <ListItemText primary="KYC Status" secondary={partner.kyc_status || 'pending'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Performance Stats
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Deliveries:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{partner.total_deliveries || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Rating:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{partner.average_rating || 0}/5.0</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Earnings:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{partner.total_earnings?.toLocaleString() || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Service Radius:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{partner.service_radius || 0} km</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Online Status:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{partner.is_online ? 'Online' : 'Offline'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Documents
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Aadhaar:</Typography>
                      <ListItemText primary="Aadhaar Number" secondary={partner.aadhaar_number || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>PAN:</Typography>
                      <ListItemText primary="PAN Number" secondary={partner.pan_number || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Driving License:</Typography>
                      <ListItemText primary="Driving License" secondary={partner.driving_license_number || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>DL Expiry:</Typography>
                      <ListItemText primary="DL Expiry" secondary={partner.driving_license_expiry ? new Date(partner.driving_license_expiry).toLocaleDateString() : 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Vehicle RC:</Typography>
                      <ListItemText primary="Vehicle RC" secondary={partner.vehicle_rc || 'Not provided'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Bank Details
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Account Number" secondary={partner.bank_account_number || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>IFSC:</Typography>
                      <ListItemText primary="IFSC Code" secondary={partner.ifsc_code || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>UPI ID:</Typography>
                      <ListItemText primary="UPI ID" secondary={partner.upi_id || 'Not provided'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Login Times Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Daily Login/Logout History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Login Time</TableCell>
                      <TableCell>Logout Time</TableCell>
                      <TableCell>Hours Worked</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockLoginData.map((login, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(login.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ mr: 1, color: 'success.main' }} />
                            {login.loginTime}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ mr: 1, color: 'error.main' }} />
                            {login.logoutTime}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{login.hoursWorked}h</TableCell>
                        <TableCell>
                          <Chip 
                            label={login.status === 'completed' ? 'Full Day' : 'Early Logout'} 
                            color={login.status === 'completed' ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Deliveries Tab */}
        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Deliveries
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Delivery ID</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Retailer</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Distance</TableCell>
                      <TableCell>Earnings</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {delivery.id}
                        </TableCell>
                        <TableCell>{delivery.orderId}</TableCell>
                        <TableCell>{delivery.customer}</TableCell>
                        <TableCell>{delivery.retailer}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            Pickup: {delivery.pickupTime}
                          </Typography>
                          <Typography variant="body2">
                            Delivery: {delivery.deliveryTime}
                          </Typography>
                        </TableCell>
                        <TableCell>{delivery.distance}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                          ₹{delivery.earnings}
                        </TableCell>
                        <TableCell>
                          <Chip label={delivery.status} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Payments Tab */}
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
                      <TableCell>Deliveries</TableCell>
                      <TableCell>Base Amount</TableCell>
                      <TableCell>Bonus</TableCell>
                      <TableCell>Total</TableCell>
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
                        <TableCell>{payment.deliveries}</TableCell>
                        <TableCell>₹{payment.amount - payment.bonus}</TableCell>
                        <TableCell sx={{ color: 'success.main' }}>₹{payment.bonus}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>₹{payment.amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.status} 
                            color={payment.status === 'completed' ? 'success' : 'warning'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Earnings Analytics Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Weekly Earnings Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={earningsAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Daily Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={earningsAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="deliveries" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Feedback Tab */}
        <TabPanel value={activeTab} index={5}>
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

        {/* Chat Tab */}
        <TabPanel value={activeTab} index={6}>
          <Card sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Live Chat with {partner.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chatMessages.map((msg) => (
                  <Box 
                    key={msg.id} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start' 
                    }}
                  >
                    <Paper 
                      sx={{ 
                        p: 2, 
                        maxWidth: '70%',
                        backgroundColor: msg.sender === 'admin' ? 'primary.main' : 'grey.100',
                        color: msg.sender === 'admin' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {msg.time}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <Button 
                variant="contained" 
                onClick={handleSendChat}
                disabled={!chatMessage.trim()}
              >
                <Send />
              </Button>
            </Box>
          </Card>
        </TabPanel>
      </DialogContent>

      {/* Email Dialog */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Email to {partner.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="To"
              value={partner.email}
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSendEmail}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
      
      <EmailComposer
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipient={partner}
        recipientType="delivery_partner"
      />
    </Dialog>
  );
}

export default DeliveryPartnerProfile;