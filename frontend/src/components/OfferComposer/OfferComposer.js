import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Tab as MuiTab,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
} from '@mui/material';
import {
  Close,
  Send,
  Smartphone,
  EmailOutlined,
  Preview,
  LocalOffer,
} from '@mui/icons-material';

const OfferComposer = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    discount_percentage: 0,
    offer_type: 'percentage', // percentage, fixed, buy_one_get_one
    target_users: 'all', // all, consumer, retailer, rider
    image_url: '',
    validity_days: 7,
    terms_conditions: '',
    sendEmail: true,
    sendPushNotification: true,
  });

  const [previewTab, setPreviewTab] = useState('consumer');

  const offerTemplates = [
    {
      id: 'discount',
      label: 'Discount Offer',
      template: {
        title: 'Special Discount - Up to 50% Off!',
        description: 'Enjoy exclusive discounts on selected products. Use code SAVE50 to claim your offer.',
        offer_type: 'percentage',
        discount_percentage: 50,
      }
    },
    {
      id: 'clearance',
      label: 'Clearance Sale',
      template: {
        title: '🔥 Clearance Sale - Huge Savings!',
        description: 'Clear out our inventory! Get up to 70% off on selected items. Limited stocks available.',
        offer_type: 'percentage',
        discount_percentage: 70,
      }
    },
    {
      id: 'free_delivery',
      label: 'Free Delivery',
      template: {
        title: '🚚 Free Delivery on Orders Above ₹500',
        description: 'Enjoy free shipping on all orders above ₹500. No minimum purchase requirements for premium members.',
        offer_type: 'fixed',
        discount_percentage: 0,
      }
    },
    {
      id: 'loyalty',
      label: 'Loyalty Reward',
      template: {
        title: '⭐ Loyalty Reward - ₹500 Cashback',
        description: 'Thank you for being a loyal customer! Enjoy ₹500 cashback on your next purchase.',
        offer_type: 'fixed',
        discount_percentage: 0,
      }
    },
  ];

  const handleTemplateSelect = (template) => {
    setOfferData(prev => ({
      ...prev,
      ...template.template,
    }));
  };

  const handleSendOffer = async () => {
    if (!offerData.title || !offerData.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      const API_BASE_URL_RAW = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const apiBaseUrl = API_BASE_URL_RAW.endsWith('/api')
        ? API_BASE_URL_RAW.replace(/\/+$/, '')
        : API_BASE_URL_RAW.replace(/\/+$/, '') + '/api';
      const authToken = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };

      const response = await fetch(`${apiBaseUrl}/notifications/send-offer`, {
        method: 'POST',
        headers,
        body: JSON.stringify(offerData),
      });

      if (response.ok) {
        alert('Offer sent successfully!');
        setOfferData({
          title: '',
          description: '',
          discount_percentage: 0,
          offer_type: 'percentage',
          target_users: 'all',
          image_url: '',
          validity_days: 7,
          terms_conditions: '',
          sendEmail: true,
          sendPushNotification: true,
        });
        onClose();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Error sending offer:', errorData || response.statusText);
        alert(errorData?.message || 'Failed to send offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Error sending offer');
    }
  };

  // Mobile Preview Component
  const MobilePreview = ({ type }) => {
    const previewStyles = {
      consumer: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#667eea',
        icon: '🛒',
      },
      retailer: {
        bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        accentColor: '#f5576c',
        icon: '🏪',
      },
      rider: {
        bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        accentColor: '#4facfe',
        icon: '🏍️',
      },
    };

    const style = previewStyles[type];

    return (
      <Box sx={{
        background: '#f0f0f0',
        borderRadius: '20px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        width: '320px',
        maxWidth: '100%',
      }}>
        {/* Phone Header */}
        <Box sx={{
          background: '#000',
          color: '#fff',
          padding: '8px',
          borderRadius: '18px 18px 0 0',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {type === 'consumer' ? '📱 Consumer App' : type === 'retailer' ? '🏪 Retailer App' : '🏍️ Rider App'}
        </Box>

        {/* Phone Content */}
        <Box sx={{
          background: '#fff',
          borderRadius: '0 0 18px 18px',
          padding: '16px',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {/* Status Bar */}
          <Box sx={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            ⏰ 9:41 AM
          </Box>

          {/* Notification Pop-up */}
          <Box sx={{
            background: style.bg,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '20px' }}>
                {style.icon}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: '700' }}>
                Locaura
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: '700', mb: 1, fontSize: '16px' }}>
              {offerData.title || 'Special Offer for You!'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.95 }}>
              {offerData.description || 'Check out our latest deals and exclusive offers.'}
            </Typography>

            {/* Discount Badge */}
            {offerData.offer_type === 'percentage' && offerData.discount_percentage > 0 && (
              <Box sx={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'inline-block',
                marginBottom: '12px',
              }}>
                <Typography variant="body2" sx={{ fontWeight: '700' }}>
                  🎉 {offerData.discount_percentage}% OFF
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, marginTop: '12px' }}>
              <Button
                size="small"
                variant="contained"
                sx={{
                  background: 'rgba(255,255,255,0.9)',
                  color: style.accentColor,
                  fontWeight: '600',
                  flex: 1,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'white',
                  }
                }}
              >
                View Offer
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  fontWeight: '600',
                  flex: 1,
                  textTransform: 'none',
                }}
              >
                Dismiss
              </Button>
            </Box>

            {/* Validity */}
            <Typography variant="caption" sx={{ display: 'block', marginTop: '12px', opacity: 0.8 }}>
              Valid for {offerData.validity_days} days
            </Typography>
          </Box>

          {/* Email Preview Card (if email enabled) */}
          {offerData.sendEmail && (
            <Box sx={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: '600' }}>
                📧 Email Preview
              </Typography>
              <Box sx={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '8px',
                fontSize: '12px',
                border: '1px solid #eee',
              }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: '600', mb: 1 }}>
                  Subject: {offerData.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {offerData.description}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOffer />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Send Offer & Notifications
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Quick Templates */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
            🎯 Quick Templates
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
            {offerTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outlined"
                size="small"
                onClick={() => handleTemplateSelect(template)}
                sx={{
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                }}
              >
                {template.label}
              </Button>
            ))}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Offer Details */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Offer Title"
                placeholder="e.g., Special 50% Discount!"
                value={offerData.title}
                onChange={(e) => setOfferData({ ...offerData, title: e.target.value })}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Offer Description"
                placeholder="Describe your offer..."
                multiline
                rows={3}
                value={offerData.description}
                onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Offer Type</InputLabel>
                <Select
                  value={offerData.offer_type}
                  label="Offer Type"
                  onChange={(e) => setOfferData({ ...offerData, offer_type: e.target.value })}
                >
                  <MenuItem value="percentage">Percentage Discount</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                  <MenuItem value="buy_one_get_one">Buy 1 Get 1</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {offerData.offer_type !== 'buy_one_get_one' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={offerData.offer_type === 'percentage' ? 'Discount %' : 'Fixed Amount (₹)'}
                  type="number"
                  min="0"
                  max={offerData.offer_type === 'percentage' ? '100' : '10000'}
                  value={offerData.discount_percentage}
                  onChange={(e) => setOfferData({ ...offerData, discount_percentage: parseInt(e.target.value) })}
                  variant="outlined"
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Users</InputLabel>
                <Select
                  value={offerData.target_users}
                  label="Target Users"
                  onChange={(e) => setOfferData({ ...offerData, target_users: e.target.value })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="consumer">Consumers Only</MenuItem>
                  <MenuItem value="retailer">Retailers Only</MenuItem>
                  <MenuItem value="rider">Riders Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Validity (Days)"
                type="number"
                min="1"
                max="365"
                value={offerData.validity_days}
                onChange={(e) => setOfferData({ ...offerData, validity_days: parseInt(e.target.value) })}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL (Optional)"
                placeholder="https://example.com/image.jpg"
                value={offerData.image_url}
                onChange={(e) => setOfferData({ ...offerData, image_url: e.target.value })}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms & Conditions"
                placeholder="Add any terms and conditions..."
                multiline
                rows={2}
                value={offerData.terms_conditions}
                onChange={(e) => setOfferData({ ...offerData, terms_conditions: e.target.value })}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Notification Methods */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
            📬 Notification Methods
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={offerData.sendPushNotification}
                  onChange={(e) => setOfferData({ ...offerData, sendPushNotification: e.target.checked })}
                />
              }
              label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Smartphone sx={{ fontSize: 18 }} /> Push Notification</Box>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={offerData.sendEmail}
                  onChange={(e) => setOfferData({ ...offerData, sendEmail: e.target.checked })}
                />
              }
              label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailOutlined sx={{ fontSize: 18 }} /> Email</Box>}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Preview Tabs */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '14px' }}>
            👁️ Preview How It Looks
          </Typography>
          <Tabs
            value={previewTab}
            onChange={(e, newValue) => setPreviewTab(newValue)}
            sx={{ mb: 2, borderBottom: '1px solid #e2e8f0' }}
          >
            <Tab label="👥 Consumer" value="consumer" />
            <Tab label="🏪 Retailer" value="retailer" />
            <Tab label="🏍️ Rider" value="rider" />
          </Tabs>

          {/* Mobile Previews */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <MobilePreview type={previewTab} />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            💡 The offer will be sent via {offerData.sendPushNotification && 'Push Notification'} {offerData.sendPushNotification && offerData.sendEmail && 'and'} {offerData.sendEmail && 'Email'} to {
              offerData.target_users === 'all' ? 'all users' :
              offerData.target_users === 'consumer' ? 'consumers' :
              offerData.target_users === 'retailer' ? 'retailers' :
              'riders'
            }
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: '#f8fafc' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSendOffer}
          variant="contained"
          startIcon={<Send />}
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }}
        >
          Send Offer Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OfferComposer;
