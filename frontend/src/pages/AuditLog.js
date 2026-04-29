import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import apiClient from '../api/axiosConfig';

function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/audit-logs', { params: { limit: 100 } });
      setAuditLogs(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      (actionFilter === 'all' || log.action === actionFilter) &&
      (resourceFilter === 'all' || log.resourceType === resourceFilter)
  );

  const handleMenuOpen = (event, log) => {
    setAnchorEl(event.currentTarget);
    setSelectedLog(log);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setOpenDetail(true);
    handleMenuClose();
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedLog(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return '#10b981';
      case 'UPDATE':
        return '#f59e0b';
      case 'DELETE':
        return '#ef4444';
      case 'READ':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        📊 Database Audit Log
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                  <MenuItem value="READ">Read</MenuItem>
                  <MenuItem value="APPROVE">Approve</MenuItem>
                  <MenuItem value="REJECT">Reject</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  value={resourceFilter}
                  label="Resource Type"
                  onChange={(e) => setResourceFilter(e.target.value)}
                >
                  <MenuItem value="all">All Resources</MenuItem>
                  <MenuItem value="Store">Store</MenuItem>
                  <MenuItem value="Rider">Rider</MenuItem>
                  <MenuItem value="Order">Order</MenuItem>
                  <MenuItem value="Product">Product</MenuItem>
                  <MenuItem value="Consumer">Consumer</MenuItem>
                  <MenuItem value="Retailer">Retailer</MenuItem>
                  <MenuItem value="Payment">Payment</MenuItem>
                  <MenuItem value="Settings">Settings</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredLogs.length > 0 ? (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <Chip
                          label={log.action}
                          sx={{
                            backgroundColor: getActionColor(log.action),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{log.resourceType}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.description}
                      </TableCell>
                      <TableCell>{log.actor?.name || 'System'}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.severity}
                          color={getSeverityColor(log.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuOpen(e, log)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
              No audit logs found
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedLog.action} - {selectedLog.resourceType}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedLog.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Actor:</Typography>
                  <Typography>{selectedLog.actor?.name || 'System'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Timestamp:</Typography>
                  <Typography>{new Date(selectedLog.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Severity:</Typography>
                  <Chip label={selectedLog.severity} color={getSeverityColor(selectedLog.severity)} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Typography>{selectedLog.status}</Typography>
                </Grid>
              </Grid>
              {selectedLog.changes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Changes</Typography>
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDetail(selectedLog)}>View Details</MenuItem>
      </Menu>
    </Container>
  );
}

export default AuditLog;