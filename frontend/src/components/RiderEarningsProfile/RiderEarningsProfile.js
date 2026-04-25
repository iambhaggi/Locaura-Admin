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
  Divider,
} from '@mui/material';
import {
  Person,
  Schedule,
  Payment,
  Analytics,
  Close,
  AccountBalance,
  Receipt,
  TrendingUp,
} from '@mui/icons-material';

function RiderEarningsProfile({ earning, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!earning) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderDetailsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rider Information
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {earning.rider?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{earning.rider?.name || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rider ID: {earning.rider?._id || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              Order Number: #{earning.order?.order_number || earning.orderId || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {earning.createdAt ? new Date(earning.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Earnings Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                  <Typography variant="h6" color="success.contrastText">
                    ₹{earning.earnings || 0}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Total Earnings
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                  <Typography variant="h6" color="warning.contrastText">
                    ₹{earning.commission || 0}
                  </Typography>
                  <Typography variant="body2" color="warning.contrastText">
                    Commission
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                  <Typography variant="h6" color="info.contrastText">
                    ₹{earning.netAmount || 0}
                  </Typography>
                  <Typography variant="body2" color="info.contrastText">
                    Net Amount
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderHistoryTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Earnings History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This earning record is part of the rider's overall earnings history.
          For complete history, view the rider's profile.
        </Typography>
        <Box mt={2}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Earnings</TableCell>
                  <TableCell>Commission</TableCell>
                  <TableCell>Net Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {earning.createdAt ? new Date(earning.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    #{earning.order?.order_number || earning.orderId || 'N/A'}
                  </TableCell>
                  <TableCell>₹{earning.earnings || 0}</TableCell>
                  <TableCell>₹{earning.commission || 0}</TableCell>
                  <TableCell>₹{earning.netAmount || 0}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Rider Earning Details
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label="History" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && renderDetailsTab()}
          {activeTab === 1 && renderHistoryTab()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RiderEarningsProfile;