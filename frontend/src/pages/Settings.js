import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Security,
  Payment,
  LocalShipping,
  Save,
} from '@mui/icons-material';

function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Locaura',
    supportEmail: 'support@locaura.com',
    supportPhone: '+91 9876543210',
    
    // Commission Settings
    retailerCommission: 10,
    deliveryCommission: 15,
    
    // Delivery Settings
    deliveryRadius: 25,
    deliveryFee: 50,
    freeDeliveryThreshold: 500,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Here you would typically save to backend
  };

  const settingSections = [
    {
      title: 'General Settings',
      icon: <SettingsIcon />,
      color: '#6366f1',
      fields: [
        { key: 'platformName', label: 'Platform Name', type: 'text' },
        { key: 'supportEmail', label: 'Support Email', type: 'email' },
        { key: 'supportPhone', label: 'Support Phone', type: 'tel' },
      ]
    },
    {
      title: 'Commission Settings',
      icon: <Payment />,
      color: '#10b981',
      fields: [
        { key: 'retailerCommission', label: 'Retailer Commission (%)', type: 'number' },
        { key: 'deliveryCommission', label: 'Delivery Commission (%)', type: 'number' },
      ]
    },
    {
      title: 'Delivery Settings',
      icon: <LocalShipping />,
      color: '#f59e0b',
      fields: [
        { key: 'deliveryRadius', label: 'Delivery Radius (km)', type: 'number' },
        { key: 'deliveryFee', label: 'Delivery Fee (₹)', type: 'number' },
        { key: 'freeDeliveryThreshold', label: 'Free Delivery Threshold (₹)', type: 'number' },
      ]
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Settings Sections */}
        {settingSections.map((section, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ backgroundColor: section.color, mr: 2 }}>
                    {section.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {section.fields.map((field) => (
                    <TextField
                      key={field.key}
                      label={field.label}
                      type={field.type}
                      value={settings[field.key]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      fullWidth
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ backgroundColor: '#8b5cf6', mr: 2 }}>
                  <Notifications />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notification Settings
                </Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="SMS Notifications" secondary="Receive notifications via SMS" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Push Notifications" secondary="Receive push notifications" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ backgroundColor: '#ef4444', mr: 2 }}>
                  <Security />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security Settings
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
                
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                  size="small"
                />
                
                <TextField
                  label="Password Expiry (days)"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                System Status
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip label="API Status" color="success" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Online</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip label="Database" color="success" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Connected</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip label="Payment Gateway" color="success" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Active</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip label="SMS Service" color="warning" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Limited</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{ 
            borderRadius: 3, 
            px: 4, 
            py: 1.5,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          Save All Settings
        </Button>
      </Box>
    </Box>
  );
}

export default Settings;