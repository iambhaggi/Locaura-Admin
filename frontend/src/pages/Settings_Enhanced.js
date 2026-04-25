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
  Divider,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Security,
  Payment,
  LocalShipping,
  Store,
  Save,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

function EnhancedSettings() {
  const [currentTab, setCurrentTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState({});

  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Locaura',
    supportEmail: 'support@locaura.com',
    supportPhone: '+91 9876543210',
    website: 'https://locaura.com',

    // Commission Settings
    retailerCommission: 10,
    deliveryCommission: 15,
    platformFee: 5,

    // Delivery Settings
    deliveryRadius: 25,
    deliveryFee: 50,
    freeDeliveryThreshold: 500,
    maxDeliveryTime: 45,

    // Payment Gateway
    paymentGateway: 'razorpay',
    razorpayKey: 'rzp_live_XXXXXXXXXXX',
    razorpaySecret: 'xxxxxxxxxxxxxxxxxxx',

    // Email Service
    emailProvider: 'sendgrid',
    sendgridApiKey: 'SG.XXXXXXXXXXXXXXXXXXXXX',
    emailFrom: 'noreply@locaura.com',

    // SMS Service
    smsProvider: 'twilio',
    twilioAccountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxx',
    twilioAuthToken: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    twilioPhoneNumber: '+1234567890',

    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    notificationEmail: 'admin@locaura.com',

    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    apiRateLimit: 1000,
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
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
        { key: 'website', label: 'Website URL', type: 'url' },
      ]
    },
    {
      title: 'Commission Settings',
      icon: <Payment />,
      color: '#10b981',
      fields: [
        { key: 'retailerCommission', label: 'Retailer Commission (%)', type: 'number' },
        { key: 'deliveryCommission', label: 'Delivery Commission (%)', type: 'number' },
        { key: 'platformFee', label: 'Platform Service Fee (%)', type: 'number' },
      ]
    },
    {
      title: 'Delivery Settings',
      icon: <LocalShipping />,
      color: '#f59e0b',
      fields: [
        { key: 'deliveryRadius', label: 'Delivery Radius (km)', type: 'number' },
        { key: 'deliveryFee', label: 'Standard Delivery Fee (₹)', type: 'number' },
        { key: 'freeDeliveryThreshold', label: 'Free Delivery Threshold (₹)', type: 'number' },
        { key: 'maxDeliveryTime', label: 'Max Delivery Time (mins)', type: 'number' },
      ]
    },
  ];

  const paymentGateways = [
    { key: 'razorpay', label: 'Razorpay', status: 'active' },
    { key: 'stripe', label: 'Stripe', status: 'inactive' },
    { key: 'paypal', label: 'PayPal', status: 'inactive' },
  ];

  const emailProviders = [
    { key: 'sendgrid', label: 'SendGrid', status: 'active' },
    { key: 'mailgun', label: 'Mailgun', status: 'inactive' },
    { key: 'ses', label: 'Amazon SES', status: 'inactive' },
  ];

  const smsProviders = [
    { key: 'twilio', label: 'Twilio', status: 'active' },
    { key: 'exotel', label: 'Exotel', status: 'inactive' },
    { key: 'firebase', label: 'Firebase Messaging', status: 'inactive' },
  ];

  const apiKeys = [
    { name: 'Admin API', key: 'admin_api_xxxxxxxxxxxx', created: '2024-01-15', status: 'active' },
    { name: 'Mobile App API', key: 'mobile_api_xxxxxxxxxxxx', created: '2024-02-20', status: 'active' },
    { name: 'Retailer Integration', key: 'retailer_api_xxxxxxxxxxxx', created: '2024-03-10', status: 'inactive' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          ⚙️ Admin Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Manage platform configuration, integrations, and security settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}
        >
          <Tab label="⚙️ General" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="💳 Payment Gateway" icon={<Payment />} iconPosition="start" />
          <Tab label="📧 Email & SMS" icon={<Notifications />} iconPosition="start" />
          <Tab label="🔐 Security" icon={<Security />} iconPosition="start" />
          <Tab label="🔑 API Keys" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>

        {/* TAB 1: General Settings */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {settingSections.map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
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
                          sx={{ background: '#f5f5f5' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* TAB 2: Payment Gateway */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Active Payment Gateways
              </Typography>
            </Grid>

            {paymentGateways.map((gateway) => (
              <Grid item xs={12} md={6} key={gateway.key}>
                <Card
                  sx={{
                    border: gateway.status === 'active' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                    background: gateway.status === 'active' ? '#f1f8f5' : '#fafafa',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {gateway.label}
                      </Typography>
                      <Chip
                        label={gateway.status === 'active' ? 'Active' : 'Inactive'}
                        color={gateway.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    {gateway.key === 'razorpay' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="API Key"
                          value={settings.razorpayKey}
                          onChange={(e) => handleInputChange('razorpayKey', e.target.value)}
                          fullWidth
                          size="small"
                          type="password"
                        />
                        <TextField
                          label="API Secret"
                          value={settings.razorpaySecret}
                          onChange={(e) => handleInputChange('razorpaySecret', e.target.value)}
                          fullWidth
                          size="small"
                          type="password"
                        />
                        <Button variant="outlined" fullWidth>
                          Test Connection
                        </Button>
                      </Box>
                    )}

                    {gateway.key !== 'razorpay' && (
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Configure this gateway to enable it
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* TAB 3: Email & SMS */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {/* Email Service */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                📧 Email Service Configuration
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <TextField
                    select
                    label="Email Provider"
                    value={settings.emailProvider}
                    onChange={(e) => handleInputChange('emailProvider', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    {emailProviders.map((provider) => (
                      <MenuItem key={provider.key} value={provider.key}>
                        {provider.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="SendGrid API Key"
                    value={settings.sendgridApiKey}
                    onChange={(e) => handleInputChange('sendgridApiKey', e.target.value)}
                    fullWidth
                    size="small"
                    type="password"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="From Email Address"
                    value={settings.emailFrom}
                    onChange={(e) => handleInputChange('emailFrom', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Button variant="outlined" fullWidth>
                    Test Email
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* SMS Service */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <TextField
                    select
                    label="SMS Provider"
                    value={settings.smsProvider}
                    onChange={(e) => handleInputChange('smsProvider', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    {smsProviders.map((provider) => (
                      <MenuItem key={provider.key} value={provider.key}>
                        {provider.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Twilio Account SID"
                    value={settings.twilioAccountSid}
                    onChange={(e) => handleInputChange('twilioAccountSid', e.target.value)}
                    fullWidth
                    size="small"
                    type="password"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Twilio Auth Token"
                    value={settings.twilioAuthToken}
                    onChange={(e) => handleInputChange('twilioAuthToken', e.target.value)}
                    fullWidth
                    size="small"
                    type="password"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Twilio Phone Number"
                    value={settings.twilioPhoneNumber}
                    onChange={(e) => handleInputChange('twilioPhoneNumber', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Button variant="outlined" fullWidth>
                    Test SMS
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Notification Settings */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🔔 Notification Channels
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        />
                      }
                      label="📧 Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.smsNotifications}
                          onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        />
                      }
                      label="📱 SMS Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.pushNotifications}
                          onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                        />
                      }
                      label="🔔 Push Notifications"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <TextField
                    label="Admin Notification Email"
                    value={settings.notificationEmail}
                    onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                    fullWidth
                    size="small"
                    type="email"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 4: Security */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    🔐 Security Settings
                  </Typography>

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
                      onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                      fullWidth
                      size="small"
                    />

                    <TextField
                      label="Password Expiry (days)"
                      type="number"
                      value={settings.passwordExpiry}
                      onChange={(e) => handleInputChange('passwordExpiry', parseInt(e.target.value))}
                      fullWidth
                      size="small"
                    />

                    <TextField
                      label="Max Login Attempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                      fullWidth
                      size="small"
                    />

                    <TextField
                      label="API Rate Limit (req/hour)"
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#856404' }}>
                    ⚠️ Security Best Practices
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      ✓ Enable Two-Factor Authentication for all admin accounts
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      ✓ Use strong passwords and rotate them regularly
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      ✓ Limit session timeout for unused sessions
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      ✓ Monitor API rate limits to prevent abuse
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      ✓ Keep API keys secure and rotate them periodically
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 5: API Keys */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  🔑 API Keys Management
                </Typography>
                <Button variant="contained" sx={{ background: '#2196f3' }}>
                  Generate New Key
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>API Key</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiKeys.map((apiKey, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: '500' }}>
                          {apiKey.name}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                color: '#666',
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {showApiKey[idx] ? apiKey.key : '*'.repeat(apiKey.key.length)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setShowApiKey((prev) => ({ ...prev, [idx]: !prev[idx] }))
                              }
                            >
                              {showApiKey[idx] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>{apiKey.created}</TableCell>
                        <TableCell>
                          <Chip
                            label={apiKey.status === 'active' ? 'Active' : 'Inactive'}
                            color={apiKey.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#f44336' }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined">
          Discard Changes
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{ background: '#2196f3' }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
}

export default EnhancedSettings;
