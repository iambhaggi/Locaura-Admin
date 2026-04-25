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
} from '@mui/material';
import {
  Close,
  Send,
  AttachFile,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from '@mui/icons-material';

const emailTemplates = {
  welcome: {
    subject: 'Welcome to Locaura Platform',
    body: `Dear [NAME],

Welcome to the Locaura platform! We're excited to have you as part of our growing community.

Your account has been successfully created and verified. You can now start using our services to connect with customers in your area.

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The Locaura Team`
  },
  verification: {
    subject: 'Account Verification Required',
    body: `Dear [NAME],

We need to verify some information on your account to ensure compliance with our platform policies.

Please log into your account and complete the verification process at your earliest convenience.

Required documents:
- Valid ID proof
- Business registration (for retailers)
- Address verification

Best regards,
The Locaura Team`
  },
  suspension: {
    subject: 'Account Status Update',
    body: `Dear [NAME],

We're writing to inform you about an update to your account status on the Locaura platform.

Your account has been temporarily suspended due to policy violations. Please review our terms of service and contact our support team for resolution.

We value your partnership and look forward to resolving this matter quickly.

Best regards,
The Locaura Team`
  },
  payment: {
    subject: 'Payment Information Update',
    body: `Dear [NAME],

This is regarding your payment information on the Locaura platform.

We've processed your recent transactions and updated your account balance. Please review the payment details in your dashboard.

If you have any questions about payments or settlements, please contact our finance team.

Best regards,
The Locaura Team`
  },
};

const EmailComposer = ({ open, onClose, recipient, recipientType = 'user' }) => {
  const [emailData, setEmailData] = useState({
    to: recipient?.email || '',
    subject: '',
    body: '',
    template: '',
  });

  const handleTemplateChange = (templateKey) => {
    const template = emailTemplates[templateKey];
    if (template) {
      setEmailData({
        ...emailData,
        subject: template.subject,
        body: template.body.replace('[NAME]', recipient?.name || 'User'),
        template: templateKey,
      });
    }
  };

  const handleSend = () => {
    // Here you would integrate with your email service
    console.log('Sending email:', emailData);
    onClose();
  };

  const getEmailHeader = () => (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
      p: 3,
      borderRadius: '12px 12px 0 0',
      textAlign: 'center',
    }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Locaura
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        Local Delivery Platform
      </Typography>
    </Box>
  );

  const getEmailFooter = () => (
    <Box sx={{ 
      background: '#f8fafc',
      p: 3,
      borderRadius: '0 0 12px 12px',
      borderTop: '1px solid #e2e8f0',
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This email was sent from Locaura Admin Portal. Please do not reply to this email.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 Locaura. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label="Support: support@locaura.com" size="small" variant="outlined" />
          <Chip label="Website: www.locaura.com" size="small" variant="outlined" />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Send Email to {recipient?.name}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Email Templates */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Email Template</InputLabel>
            <Select
              value={emailData.template}
              label="Email Template"
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <MenuItem value="">Custom Email</MenuItem>
              <MenuItem value="welcome">Welcome Message</MenuItem>
              <MenuItem value="verification">Verification Required</MenuItem>
              <MenuItem value="suspension">Account Suspension</MenuItem>
              <MenuItem value="payment">Payment Update</MenuItem>
            </Select>
          </FormControl>

          {/* Email Form */}
          <TextField
            fullWidth
            label="To"
            value={emailData.to}
            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
            sx={{ mb: 2 }}
            disabled
          />

          <TextField
            fullWidth
            label="Subject"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            sx={{ mb: 2 }}
          />

          {/* Email Preview */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Email Preview
          </Typography>
          
          <Box sx={{ 
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
          }}>
            {getEmailHeader()}
            
            <Box sx={{ p: 3, minHeight: 200, background: 'white' }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                placeholder="Type your message here..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    border: 'none',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>
            
            {getEmailFooter()}
          </Box>

          {/* Formatting Tools */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <IconButton size="small" sx={{ border: '1px solid #e2e8f0' }}>
              <FormatBold />
            </IconButton>
            <IconButton size="small" sx={{ border: '1px solid #e2e8f0' }}>
              <FormatItalic />
            </IconButton>
            <IconButton size="small" sx={{ border: '1px solid #e2e8f0' }}>
              <FormatUnderlined />
            </IconButton>
            <IconButton size="small" sx={{ border: '1px solid #e2e8f0' }}>
              <AttachFile />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: '#f8fafc' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSend} 
          variant="contained" 
          startIcon={<Send />}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          Send Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailComposer;