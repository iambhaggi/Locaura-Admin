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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Payment,
  Receipt,
  Close,
} from '@mui/icons-material';

function PaymentProfile({ payment, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!payment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Payment Details - {payment._id}
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
                <Payment />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                ₹{payment.amount}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {payment.method} - {payment.gateway}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={payment.status} 
                  color={getStatusColor(payment.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Receipt />} label="Details" />
            <Tab icon={<Payment />} label="Gateway" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Payment Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Payment sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Amount" secondary={`₹${payment.amount}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Currency:</Typography>
                      <ListItemText primary="Currency" secondary={payment.currency} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Method:</Typography>
                      <ListItemText primary="Payment Method" secondary={payment.method} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Status:</Typography>
                      <ListItemText primary="Status" secondary={payment.status} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Additional Details
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Order ID:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{payment.order_id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Consumer ID:</Typography>
                    <Typography>{payment.consumer_id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Retailer ID:</Typography>
                    <Typography>{payment.retailer_id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Created:</Typography>
                    <Typography>{new Date(payment.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  {payment.updatedAt && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Updated:</Typography>
                      <Typography>{new Date(payment.updatedAt).toLocaleDateString()}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Gateway Information
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <Typography sx={{ mr: 2, color: 'primary.main' }}>Gateway:</Typography>
                  <ListItemText primary="Payment Gateway" secondary={payment.gateway} />
                </ListItem>
                {payment.gateway_order_id && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'primary.main' }}>Gateway Order ID:</Typography>
                    <ListItemText primary="Gateway Order ID" secondary={payment.gateway_order_id} />
                  </ListItem>
                )}
                {payment.gateway_payment_id && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'primary.main' }}>Gateway Payment ID:</Typography>
                    <ListItemText primary="Gateway Payment ID" secondary={payment.gateway_payment_id} />
                  </ListItem>
                )}
                {payment.gateway_signature && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'primary.main' }}>Gateway Signature:</Typography>
                    <ListItemText primary="Gateway Signature" secondary={payment.gateway_signature} />
                  </ListItem>
                )}
                {payment.failure_reason && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'error.main' }}>Failure Reason:</Typography>
                    <ListItemText primary="Failure Reason" secondary={payment.failure_reason} />
                  </ListItem>
                )}
                {payment.refund_id && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'info.main' }}>Refund ID:</Typography>
                    <ListItemText primary="Refund ID" secondary={payment.refund_id} />
                  </ListItem>
                )}
                {payment.refunded_at && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'info.main' }}>Refunded At:</Typography>
                    <ListItemText primary="Refunded At" secondary={new Date(payment.refunded_at).toLocaleString()} />
                  </ListItem>
                )}
                {payment.refund_amount != null && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'info.main' }}>Refund Amount:</Typography>
                    <ListItemText primary="Refund Amount" secondary={`₹${payment.refund_amount}`} />
                  </ListItem>
                )}
                {payment.metadata && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography sx={{ mr: 2, color: 'primary.main' }}>Metadata:</Typography>
                    <ListItemText primary="Metadata" secondary={JSON.stringify(payment.metadata)} />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentProfile;