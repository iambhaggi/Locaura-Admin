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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  LocationOn,
  Close,
} from '@mui/icons-material';

function OrderProfile({ order, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Order Details - {order.order_number}
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
                <ShoppingCart />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Order #{order.order_number || order.orderNumber}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {order.consumer?.name || order.customer?.name || order.consumer_name || 'Customer'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={order.status || 'pending'} 
                  color={getStatusColor(order.status)}
                  size="small"
                />
                <Chip 
                  label={order.payment?.status || 'pending'} 
                  color={getStatusColor(order.payment?.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<ShoppingCart />} label="Items" />
            <Tab icon={<Payment />} label="Pricing" />
            <Tab icon={<LocationOn />} label="Delivery" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Items
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.variant_label}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.unit_price}</TableCell>
                        <TableCell>₹{item.total_price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Order Pricing
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Subtotal:</Typography>
                      <ListItemText primary="" secondary={`₹${order.pricing?.subtotal || 0}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Delivery Fee:</Typography>
                      <ListItemText primary="" secondary={`₹${order.pricing?.delivery_fee || 0}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Discount:</Typography>
                      <ListItemText primary="" secondary={`₹${order.pricing?.discount || 0}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Tax:</Typography>
                      <ListItemText primary="" secondary={`₹${order.pricing?.tax || 0}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, fontWeight: 600, color: 'primary.main' }}>Total:</Typography>
                      <ListItemText primary="" secondary={`₹${order.pricing?.total || 0}`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Order Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Status:</Typography>
                    <Chip label={order.status || 'pending'} color={getStatusColor(order.status)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Payment Method:</Typography>
                    <Typography>{order.payment?.method || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Payment Status:</Typography>
                    <Chip label={order.payment?.status || 'pending'} color={getStatusColor(order.payment?.status)} size="small" />
                  </Box>
                  {order.payment?.reference && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Payment Ref:</Typography>
                      <Typography>{order.payment.reference}</Typography>
                    </Box>
                  )}
                  {order.payment?.paid_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Paid At:</Typography>
                      <Typography>{new Date(order.payment.paid_at).toLocaleString()}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Created:</Typography>
                    <Typography>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</Typography>
                  </Box>
                </CardContent>
              </Card>
              {order.status_history?.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Status History
                    </Typography>
                    <List>
                      {order.status_history.map((event, idx) => (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemText
                            primary={`${event.status} • ${new Date(event.timestamp).toLocaleString()}`}
                            secondary={`${event.note || ''} ${event.actor_role ? `by ${event.actor_role}` : ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Delivery Information
              </Typography>
              {order.delivery_address ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Delivery Address
                  </Typography>
                  <Typography variant="body2">
                    {order.delivery_address.line1}<br />
                    {order.delivery_address.line2 && <>{order.delivery_address.line2}<br /></>}
                    {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
                  </Typography>
                  {order.delivery_address.location?.coordinates && (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Coordinates: {order.delivery_address.location.coordinates.join(', ')}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">No delivery address available</Typography>
              )}
              {(order.special_instructions || order.estimated_delivery_at || order.delivered_at) && (
                <Box sx={{ mt: 3 }}>
                  {order.special_instructions && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Special Instructions</Typography>
                      <Typography variant="body2">{order.special_instructions}</Typography>
                    </Box>
                  )}
                  {order.estimated_delivery_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Estimated Delivery:</Typography>
                      <Typography>{new Date(order.estimated_delivery_at).toLocaleString()}</Typography>
                    </Box>
                  )}
                  {order.delivered_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Delivered At:</Typography>
                      <Typography>{new Date(order.delivered_at).toLocaleString()}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default OrderProfile;