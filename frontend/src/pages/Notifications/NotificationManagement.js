import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Mail as MailIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { EMAIL_TEMPLATES, NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from './EmailTemplates';
import { getNotificationStats } from '../../api/endpoints';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';

function NotificationManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [recipient, setRecipient] = useState('consumers');
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedNotification, setDeletedNotification] = useState(null);
  const [notificationStats, setNotificationStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
        const response = await getNotificationStats();
        setNotificationStats(response.data?.data || {});
      } catch (err) {
        console.error('Failed to load notification stats', err);
        setStatsError('Failed to load notification stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    template: null,
    channels: ['push'],
    recipientType: 'consumers',
    recipientId: '',
    variables: {},
  });

  // Channel-specific template content
  const getChannelTemplate = (template, channel) => {
    if (!template) return '';
    if (channel === 'email') {
      return template.subject + '\n\n' + template.template({});
    } else if (channel === 'sms') {
      // SMS is short, so use just the title and first line
      return `${template.title}: ${template.subject.substring(0, 100)}...`;
    } else if (channel === 'push') {
      // Push notification - just title and subject
      return `${template.title}\n${template.subject}`;
    }
    return '';
  };

  const [sentNotifications, setSentNotifications] = useState([]);

  const handleSendNotification = () => {
    setSuccessMessage(`Notification sent to ${recipient}!`);
    setSentNotifications([
      {
        _id: (sentNotifications.length + 1).toString(),
        title: notificationData.title,
        recipient: 'User Name (user@example.com)',
        type: recipient,
        channels: notificationData.channels,
        status: 'delivered',
        sentAt: new Date().toLocaleString(),
      },
      ...sentNotifications,
    ]);
    setOpenSendDialog(false);
    setNotificationData({
      title: '',
      message: '',
      template: null,
      channels: ['push'],
      recipientType: 'consumers',
      recipientId: '',
      variables: {},
    });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSelectTemplate = (template) => {
    // Get the currently selected channel or the first selected channel
    const activeChannel = notificationData.channels.length > 0 ? notificationData.channels[0] : 'push';
    const channelContent = getChannelTemplate(template, activeChannel);
    
    setSelectedTemplate(template);
    setNotificationData({
      ...notificationData,
      title: template.title,
      message: channelContent,
      template: template,
    });
    setOpenTemplateDialog(false);
  };

  // Handle template use from Email Templates tab
  const handleUseTemplateFromTab = (template) => {
    // Switch to Send Notification tab
    setCurrentTab(0);
    
    // Set email as the channel
    setNotificationData({
      ...notificationData,
      title: template.title,
      message: template.subject + '\n\n' + template.template({}),
      template: template,
      channels: ['email'], // Default to email channel for email templates
    });
    
    setSuccessMessage(`✓ Template "${template.title}" loaded. Ready to send!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle Select All Recipients
  const handleSelectAllRecipients = (recipientType) => {
    setRecipient(recipientType);
    setCurrentTab(0); // Switch to Send Notification tab
    setSuccessMessage(`✓ Selected all ${recipientType}. Ready to compose message!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      setDeletedNotification(notificationToDelete);
      setIsDeleted(true);
      setSentNotifications(sentNotifications.filter(n => n._id !== notificationToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedNotification) {
      setSentNotifications([...sentNotifications, deletedNotification]);
      setDeleteDialog(false);
      setDeletedNotification(null);
      setNotificationToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setNotificationToDelete(null);
    }
  };

  const recipientStats = {
    consumers: { total: notificationStats.by_role?.consumer ?? 0, online: 0 },
    retailers: { total: notificationStats.by_role?.retailer ?? 0, active: 0 },
    riders: { total: notificationStats.by_role?.rider ?? 0, online: 0 },
  };

  const hasStatsError = statsError && !statsLoading;

  const stats = [
    {
      label: 'Total Consumers',
      value: recipientStats.consumers.total,
      online: recipientStats.consumers.online,
      icon: '👥',
      color: '#2196f3',
    },
    {
      label: 'Active Retailers',
      value: recipientStats.retailers.total,
      active: recipientStats.retailers.active,
      icon: '🏪',
      color: '#10b981',
    },
    {
      label: 'Delivery Partners',
      value: recipientStats.riders.total,
      online: recipientStats.riders.online,
      icon: '🚚',
      color: '#f59e0b',
    },
  ];

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          📢 Notification Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Send notifications and emails to consumers, retailers, and delivery partners
        </Typography>
      </Box>

      {statsLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading notification stats...
        </Alert>
      )}
      {hasStatsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {statsError}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ background: '#f5f5f5', border: `2px solid ${stat.color}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>{stat.icon}</Typography>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}
        >
          <Tab label="📤 Send Notification" icon={<SendIcon />} iconPosition="start" />
          <Tab label="📋 All Recipients" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="📧 Email Templates" icon={<MailIcon />} iconPosition="start" />
          <Tab label="📊 Notification History" icon={<MailIcon />} iconPosition="start" />
        </Tabs>

        {/* TAB 1: Send Notification */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Select Recipients
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['consumers', 'retailers', 'riders'].map((type) => (
                  <Button
                    key={type}
                    variant={recipient === type ? 'contained' : 'outlined'}
                    onClick={() => setRecipient(type)}
                    sx={{
                      justifyContent: 'flex-start',
                      p: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    {type === 'consumers' && '👥 All Consumers'}
                    {type === 'retailers' && '🏪 All Retailers'}
                    {type === 'riders' && '🚚 All Delivery Partners'}
                  </Button>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Compose Message
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Notification Title"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  placeholder="e.g., Order Placed Successfully"
                />
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                  placeholder="Write your message here..."
                />

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📢 Notification Channels
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', mb: 2, display: 'block' }}>
                    {selectedTemplate ? '✓ Template selected - Message will adapt to each channel' : 'Select channels for this notification'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <FormControlLabel
                        key={channel.key}
                        control={
                          <Checkbox
                            checked={notificationData.channels.includes(channel.key)}
                            onChange={(e) => {
                              let newChannels = notificationData.channels;
                              if (e.target.checked) {
                                newChannels = [...newChannels, channel.key];
                              } else {
                                newChannels = newChannels.filter((c) => c !== channel.key);
                              }
                              
                              // Update message if template is selected
                              let newMessage = notificationData.message;
                              if (selectedTemplate && newChannels.length > 0) {
                                newMessage = getChannelTemplate(selectedTemplate, newChannels[0]);
                              }
                              
                              setNotificationData({
                                ...notificationData,
                                channels: newChannels,
                                message: newMessage,
                              });
                            }}
                          />
                        }
                        label={`${channel.icon} ${channel.label}`}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenTemplateDialog(true)}
                    startIcon={<PreviewIcon />}
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setOpenSendDialog(true)}
                    startIcon={<SendIcon />}
                    sx={{ background: '#2196f3' }}
                    disabled={!notificationData.title || !notificationData.message}
                  >
                    Send Now
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 2: All Recipients */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '2px solid #2196f3' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    👥 Consumers
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Total
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                        {recipientStats.consumers.total}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Currently Online
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {recipientStats.consumers.online}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ background: '#2196f3' }}
                    onClick={() => handleSelectAllRecipients('consumers')}
                  >
                    Select All
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Retailers */}
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '2px solid #10b981' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🏪 Retailers
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Total
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                        {recipientStats.retailers.total}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Active Stores
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {recipientStats.retailers.active}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ background: '#10b981' }}
                    onClick={() => handleSelectAllRecipients('retailers')}
                  >
                    Select All
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Riders */}
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '2px solid #f59e0b' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🚚 Delivery Partners
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Total
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
                        {recipientStats.riders.total}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Online Now
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {recipientStats.riders.online}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ background: '#f59e0b' }}
                    onClick={() => handleSelectAllRecipients('riders')}
                  >
                    Select All
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 3: Email Templates */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            📧 Pre-defined Email Templates
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {template.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      {template.subject.substring(0, 50)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {template.variables.slice(0, 3).map((v) => (
                        <Chip key={v} label={v} size="small" variant="outlined" />
                      ))}
                      {template.variables.length > 3 && (
                        <Chip label={`+${template.variables.length - 3}`} size="small" />
                      )}
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedTemplate(template)}
                      sx={{ color: '#666' }}
                    >
                      Preview
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleUseTemplateFromTab(template)}
                      sx={{ background: '#2196f3' }}
                    >
                      Use Template
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Template Preview Dialog */}
          {selectedTemplate && (
            <Dialog 
              open={!!selectedTemplate} 
              onClose={() => setSelectedTemplate(null)} 
              maxWidth="md" 
              fullWidth
            >
              <DialogTitle sx={{ background: '#2196f3', color: 'white', fontWeight: 'bold' }}>
                {selectedTemplate.title}
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Subject:
                </Typography>
                <Typography variant="body2" sx={{ background: '#f5f5f5', p: 2, mb: 2, borderRadius: 1 }}>
                  {selectedTemplate.subject}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Variables:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedTemplate.variables.map((v) => (
                    <Chip key={v} label={v} variant="outlined" />
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedTemplate(null)}>Close</Button>
              </DialogActions>
            </Dialog>
          )}
        </TabPanel>

        {/* TAB 4: Notification History */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            📊 Sent Notifications
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Recipient</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Channels</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sent At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sentNotifications.map((notif) => (
                  <TableRow key={notif._id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {notif.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{notif.recipient}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {notif.channels.map((ch) => (
                          <Chip
                            key={ch}
                            label={ch}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notif.status}
                        color={notif.status === 'delivered' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '12px', color: '#999' }}>
                        {notif.sentAt}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Send Confirmation Dialog */}
      <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: '#2196f3', color: 'white', fontWeight: 'bold' }}>
          ✓ Confirm Send
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Send notification to all {recipient}?
          </Typography>
          <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {notificationData.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              {notificationData.message}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSendDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendNotification} sx={{ background: '#2196f3' }}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: '#2196f3', color: 'white', fontWeight: 'bold' }}>
          Select Template
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant="outlined"
                onClick={() => handleSelectTemplate(template)}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {template.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    {template.subject}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Notification"
        description="This notification will be deleted. You have 10 seconds to undo this action."
        itemName={notificationToDelete?.title || 'Notification'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
}

export default NotificationManagement;
