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
  LocationOn,
  Phone,
  Email,
  Close,
} from '@mui/icons-material';

function ConsumerProfile({ consumer, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'deleted': return 'error';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!consumer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Consumer Profile - {consumer.consumer_name || consumer.name}
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
                {(consumer.consumer_name || consumer.name)?.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {consumer.consumer_name || consumer.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {consumer.email || 'Email not available'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={consumer.status}
                  color={getStatusColor(consumer.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(consumer.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Person />} label="Details" />
            <Tab icon={<ShoppingBag />} label="Cart" />
            <Tab icon={<LocationOn />} label="Addresses" />
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
                      <ListItemText primary="Consumer ID" secondary={consumer._id || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Person sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Full Name" secondary={consumer.consumer_name || consumer.name || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Email" secondary={consumer.email || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Phone" secondary={consumer.phone || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="OTP" secondary={consumer.otp || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="OTP Expiry" secondary={consumer.otp_expiry ? new Date(consumer.otp_expiry).toLocaleString() : 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="FCM Token" secondary={consumer.fcm_token || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="FCM Token Count" secondary={consumer.fcm_tokens?.length ?? 0} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Created At" secondary={consumer.createdAt ? new Date(consumer.createdAt).toLocaleString() : 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Updated At" secondary={consumer.updatedAt ? new Date(consumer.updatedAt).toLocaleString() : 'N/A'} />
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
                    <Typography sx={{ fontWeight: 600 }}>{consumer.totalOrders || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Account Status:</Typography>
                    <Chip label={consumer.status} color={getStatusColor(consumer.status)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Phone Verified:</Typography>
                    <Typography>{consumer.phone_verified ? 'Yes' : 'No'}</Typography>
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
                Cart Items
              </Typography>
              {consumer.cart?.items?.length > 0 ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Store: {consumer.cart.store_name || 'N/A'}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Variant</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>SKU</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Color</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consumer.cart.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name || item.variant_label || 'N/A'}</TableCell>
                            <TableCell>{item.variant_label || item.variant_sku || 'N/A'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.price || 0}</TableCell>
                            <TableCell>{item.brand_name || 'N/A'}</TableCell>
                            <TableCell>{item.variant_sku || 'N/A'}</TableCell>
                            <TableCell>{item.size || 'N/A'}</TableCell>
                            <TableCell>{item.color || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Typography>Subtotal: ₹{consumer.cart.subtotal ?? 0}</Typography>
                    <Typography>Platform Fee: ₹{consumer.cart.platform_fee ?? 0}</Typography>
                    <Typography>Delivery Fee: ₹{consumer.cart.delivery_fee ?? 0}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>Total: ₹{consumer.cart.total ?? 0}</Typography>
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">No items in cart</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Addresses
              </Typography>
              {consumer.addresses?.length > 0 ? (
                <Grid container spacing={2}>
                  {consumer.addresses.map((address, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {address.label} {address.is_default ? '(Default)' : ''}
                        </Typography>
                        <Typography variant="body2">
                          {address.line1}<br />
                          {address.line2 && <>{address.line2}<br /></>}
                          {address.city}, {address.state} - {address.pincode}<br />
                          {address.phone_number && <>Phone: {address.phone_number}<br /></>}
                          Coordinates: {address.location?.coordinates?.join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Address ID: {address._id || 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">No addresses found</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default ConsumerProfile;