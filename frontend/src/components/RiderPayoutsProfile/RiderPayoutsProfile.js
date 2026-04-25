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
  Payment,
  Analytics,
  Close,
  AccountBalance,
  Receipt,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';

function RiderPayoutsProfile({ payout, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!payout) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const renderDetailsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payout Recipient
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {(payout.retailer?.name || payout.store?.name || payout.rider?.name || 'P')[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{payout.retailer?.name || payout.store?.name || payout.rider?.name || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {payout.retailer?._id ? `Retailer ID: ${payout.retailer._id}` : payout.store?._id ? `Store ID: ${payout.store._id}` : payout.rider?._id ? `Rider ID: ${payout.rider._id}` : 'N/A'}
                </Typography>
                {payout.store?.name && (
                  <Typography variant="body2" color="text.secondary">
                    Store: {payout.store.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payout Summary
            </Typography>
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                Total Orders: {payout.total_orders ?? 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Revenue: ₹{payout.total_revenue ?? 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Platform Fee: ₹{payout.platform_fee ?? 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Net Payout: ₹{payout.net_payout ?? 0}
              </Typography>
              <Box mt={1}>
                <Chip
                  label={payout.status || 'pending'}
                  color={getStatusColor(payout.status)}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payout Reference
            </Typography>
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                Reference: {payout.payout_reference || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Paid At: {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : 'Not paid'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              {payout.updatedAt && (
                <Typography variant="body2" color="text.secondary">
                  Updated: {new Date(payout.updatedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payout Period
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                  <Typography variant="body2" color="primary.contrastText">
                    Start Date
                  </Typography>
                  <Typography variant="h6" color="primary.contrastText">
                    {payout.period?.from ? new Date(payout.period.from).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light' }}>
                  <Typography variant="body2" color="secondary.contrastText">
                    End Date
                  </Typography>
                  <Typography variant="h6" color="secondary.contrastText">
                    {payout.period?.to ? new Date(payout.period.to).toLocaleDateString() : 'N/A'}
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
          Payout History
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          This payout record is part of the payout history. For complete history, view the related profile.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Period</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>₹{payout.net_payout ?? payout.amount ?? 0}</TableCell>
                <TableCell>{payout.payout_reference || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={payout.status || 'pending'}
                    color={getStatusColor(payout.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {payout.period?.from && payout.period?.to ?
                    `${new Date(payout.period.from).toLocaleDateString()} - ${new Date(payout.period.to).toLocaleDateString()}` :
                    'N/A'
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
            Payout Details
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

export default RiderPayoutsProfile;