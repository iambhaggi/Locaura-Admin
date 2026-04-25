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
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Divider,
  Badge,
} from '@mui/material';
import {
  Store,
  Inventory,
  Analytics,
  Payment,
  Feedback,
  Chat,
  Email,
  Phone,
  LocationOn,
  Close,
  Send,
  Reply,
  Edit,
  Delete,
  Add,
  Image,
  AttachMoney,
  Percent,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import EmailComposer from '../EmailComposer/EmailComposer';

function RetailerProfile({ retailer, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [replyText, setReplyText] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [editDialog, setEditDialog] = useState(false);

  // Mock inventory data
  const mockInventory = [
    {
      id: 1,
      name: 'Cotton T-Shirt',
      category: 'Shirts',
      price: 599,
      discount: 10,
      stock: 25,
      image: '/api/placeholder/200/200',
      description: 'Premium cotton t-shirt',
      sku: 'TS001'
    },
    {
      id: 2,
      name: 'Denim Jeans',
      category: 'Pants',
      price: 1299,
      discount: 15,
      stock: 18,
      image: '/api/placeholder/200/200',
      description: 'Classic blue denim jeans',
      sku: 'DJ002'
    },
    {
      id: 3,
      name: 'Formal Shirt',
      category: 'Shirts',
      price: 899,
      discount: 0,
      stock: 12,
      image: '/api/placeholder/200/200',
      description: 'White formal shirt',
      sku: 'FS003'
    },
  ];

  // Mock analytics data
  const salesAnalytics = [
    { month: 'Jan', sales: 45000, orders: 120, products: 8 },
    { month: 'Feb', sales: 52000, orders: 140, products: 12 },
    { month: 'Mar', sales: 48000, orders: 130, products: 15 },
    { month: 'Apr', sales: 61000, orders: 165, products: 18 },
    { month: 'May', sales: 58000, orders: 155, products: 20 },
    { month: 'Jun', sales: 67000, orders: 180, products: 22 },
  ];

  const categoryData = [
    { name: 'Shirts', value: 45, color: '#6366f1' },
    { name: 'Pants', value: 30, color: '#10b981' },
    { name: 'Accessories', value: 25, color: '#f59e0b' },
  ];

  // Mock payments data
  const mockPayments = [
    { id: 'PAY001', date: '2024-03-15', amount: 12450, commission: 1245, net: 11205, status: 'completed' },
    { id: 'PAY002', date: '2024-03-10', amount: 8900, commission: 890, net: 8010, status: 'completed' },
    { id: 'PAY003', date: '2024-03-05', amount: 15600, commission: 1560, net: 14040, status: 'pending' },
  ];

  // Mock feedback data
  const mockFeedback = [
    {
      id: 1,
      date: '2024-03-15',
      type: 'complaint',
      subject: 'Product quality issue',
      message: 'The shirt I received had a defect. Please help.',
      status: 'open',
      adminReply: null
    },
    {
      id: 2,
      date: '2024-03-10',
      type: 'suggestion',
      subject: 'New product request',
      message: 'Can you add more formal wear options?',
      status: 'resolved',
      adminReply: 'Thank you for the suggestion. We will discuss this with you.'
    },
  ];

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'admin', message: 'Hello! How can I help you today?', time: '10:30 AM' },
    { id: 2, sender: 'retailer', message: 'I need help with product approval process.', time: '10:32 AM' },
    { id: 3, sender: 'admin', message: 'Sure! I can guide you through the process.', time: '10:35 AM' },
  ]);

  const handleSendEmail = () => {
    console.log('Sending email to retailer');
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

  const handleEditProduct = (product) => {
    setEditProduct({ ...product });
    setEditDialog(true);
  };

  const handleSaveProduct = () => {
    console.log('Saving product:', editProduct);
    setEditDialog(false);
    setEditProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    console.log('Deleting product:', productId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!retailer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Retailer Profile - {retailer.retailer_name}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, backgroundColor: 'success.main' }}>
                <Store sx={{ fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {retailer.retailer_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {retailer.email} • {retailer.phone}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={retailer.phone_verified ? 'Phone Verified' : 'Phone Unverified'} 
                  color={retailer.phone_verified ? 'success' : 'warning'}
                  size="small"
                />
                <Chip 
                  label={retailer.email_verified ? 'Email Verified' : 'Email Unverified'} 
                  color={retailer.email_verified ? 'success' : 'warning'}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Joined {new Date(retailer.createdAt).toLocaleDateString()}
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
            <Tab icon={<Store />} label="Details" />
            <Tab icon={<Inventory />} label="Inventory" />
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<Payment />} label="Payments" />
            <Tab icon={<Feedback />} label="Feedback" />
            <Tab 
              icon={
                <Badge badgeContent={3} color="error">
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
                    Store Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Store sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Retailer Name" secondary={retailer.retailer_name} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>PAN Card:</Typography>
                      <ListItemText primary="PAN Card" secondary={retailer.pan_card || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Email" secondary={retailer.email} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Phone" secondary={retailer.phone} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Phone Verified:</Typography>
                      <Chip 
                        label={retailer.phone_verified ? 'Verified' : 'Unverified'} 
                        color={retailer.phone_verified ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Email Verified:</Typography>
                      <Chip 
                        label={retailer.email_verified ? 'Verified' : 'Unverified'} 
                        color={retailer.email_verified ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                    {retailer.otp && (
                      <ListItem sx={{ px: 0 }}>
                        <Typography sx={{ mr: 2, color: 'primary.main' }}>OTP:</Typography>
                        <ListItemText primary="Current OTP" secondary={retailer.otp} />
                      </ListItem>
                    )}
                    {retailer.otp_expiry && (
                      <ListItem sx={{ px: 0 }}>
                        <Typography sx={{ mr: 2, color: 'primary.main' }}>OTP Expiry:</Typography>
                        <ListItemText primary="OTP Expiry" secondary={new Date(retailer.otp_expiry).toLocaleString()} />
                      </ListItem>
                    )}
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>FCM Token:</Typography>
                      <ListItemText primary="FCM Token" secondary={retailer.fcm_token ? 'Present' : 'Not set'} />
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
                    <Typography>Total Orders:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{retailer.totalOrders}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Total Revenue:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{retailer.totalRevenue?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Rating:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{retailer.rating}/5.0</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Products Listed:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{retailer.products}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Inventory Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Product Inventory
            </Typography>
            <Button variant="contained" startIcon={<Add />}>
              Add Product
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {mockInventory.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      style={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        sx={{ backgroundColor: 'white' }}
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ backgroundColor: 'white' }}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Price:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{product.price}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Discount:</Typography>
                      <Typography variant="body2" color="success.main">{product.discount}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Stock:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.stock} units</Typography>
                    </Box>
                    <Chip label={product.category} size="small" variant="outlined" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Sales & Orders Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Category Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
                      <TableCell>Gross Amount</TableCell>
                      <TableCell>Commission</TableCell>
                      <TableCell>Net Amount</TableCell>
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
                        <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>₹{payment.commission}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>₹{payment.net.toLocaleString()}</TableCell>
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

        {/* Feedback Tab */}
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
        <TabPanel value={activeTab} index={5}>
          <Card sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Live Chat with {retailer.retailer_name}
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
        <DialogTitle>Send Email to {retailer.retailer_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="To"
              value={retailer.email}
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

      {/* Edit Product Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editProduct && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={editProduct.name}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={editProduct.price}
                onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <AttachMoney /> }}
              />
              <TextField
                fullWidth
                label="Discount (%)"
                type="number"
                value={editProduct.discount}
                onChange={(e) => setEditProduct({...editProduct, discount: e.target.value})}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <Percent /> }}
              />
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={editProduct.stock}
                onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      <EmailComposer
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipient={retailer}
        recipientType="retailer"
      />
    </Dialog>
  );
}

export default RetailerProfile;