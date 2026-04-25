import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
  FileDownload as DownloadIcon,
  Search as SearchIcon,
  FilePresent as DocumentIcon,
} from '@mui/icons-material';
import { retailersAPI } from '../../services/apiService';

const RetailerKYC = () => {
  const [kycRecords, setKycRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuKycId, setMenuKycId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMenuClick = (event, kycId) => {
    setAnchorEl(event.currentTarget);
    setMenuKycId(kycId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuKycId(null);
  };

  const handleViewDetails = (kyc) => {
    setSelectedKyc(kyc);
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedKyc(null);
  };

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await retailersAPI.getAll({ limit: 1000 });
        const retailers = response.data?.data || response.data || [];
        const records = Array.isArray(retailers)
          ? retailers.map((retailer) => ({
              ...retailer,
              kyc_status:
                retailer.phone_verified && retailer.email_verified
                  ? 'verified'
                  : 'pending',
              documents: {
                id_proof: {
                  type: 'ID Proof',
                  number: retailer.pan_card || 'N/A',
                  status: retailer.phone_verified ? 'verified' : 'pending',
                },
                address_proof: {
                  type: 'Address Proof',
                  number: retailer.email || 'N/A',
                  status: retailer.email_verified ? 'verified' : 'pending',
                },
                business_license: {
                  type: 'Business License',
                  number: retailer.phone || 'N/A',
                  status:
                    retailer.phone_verified && retailer.email_verified
                      ? 'verified'
                      : 'pending',
                },
              },
            }))
          : [];
        setKycRecords(records);
      } catch (fetchError) {
        console.error('Error fetching retailer KYC records:', fetchError);
        setError('Unable to load retailer KYC data.');
      } finally {
        setLoading(false);
      }
    };

    fetchKyc();
  }, []);

  const handleApproveKyc = (kycId) => {
    setKycRecords(
      kycRecords.map((kyc) =>
        kyc._id === kycId
          ? { ...kyc, kyc_status: 'verified', verified_at: new Date().toISOString() }
          : kyc
      )
    );
    if (selectedKyc && selectedKyc._id === kycId) {
      setSelectedKyc({
        ...selectedKyc,
        kyc_status: 'verified',
        verified_at: new Date().toISOString(),
      });
    }
  };

  const handleRejectKyc = (kycId) => {
    setKycRecords(
      kycRecords.map((kyc) =>
        kyc._id === kycId
          ? {
              ...kyc,
              kyc_status: 'rejected',
              rejection_reason: 'Documents do not meet requirements',
            }
          : kyc
      )
    );
    if (selectedKyc && selectedKyc._id === kycId) {
      setSelectedKyc({
        ...selectedKyc,
        kyc_status: 'rejected',
        rejection_reason: 'Documents do not meet requirements',
      });
    }
  };

  const filteredKyc = kycRecords.filter((kyc) => {
    const name = kyc.retailer_name || '';
    const phone = kyc.phone || '';
    const email = kyc.email || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && kyc.kyc_status === statusFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const stats = [
    {
      label: 'Total KYC Applications',
      value: kycRecords.length,
      color: '#3f51b5',
    },
    {
      label: 'Verified',
      value: kycRecords.filter((k) => k.kyc_status === 'verified').length,
      color: '#4caf50',
    },
    {
      label: 'Pending',
      value: kycRecords.filter((k) => k.kyc_status === 'pending').length,
      color: '#ff9800',
    },
    {
      label: 'Rejected',
      value: kycRecords.filter((k) => k.kyc_status === 'rejected').length,
      color: '#f44336',
    },
  ];

  const getDocumentStatus = (doc) => {
    const status = doc?.status || 'pending';
    if (status === 'verified') {
      return (
        <Chip
          label="Verified"
          size="small"
          icon={<CheckIcon />}
          color="success"
          variant="outlined"
        />
      );
    }

    return (
      <Chip label="Pending" size="small" variant="outlined" />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          🪪 Retailer KYC Verification
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: stat.color, fontWeight: 'bold' }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, or email..."
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
              <TextField
                fullWidth
                select
                label="KYC Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Retailer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ID Proof</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address Proof</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Business License</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>KYC Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKyc.map((kyc) => (
              <TableRow key={kyc._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#3f51b5' }}>
                      {kyc.retailer_name ? kyc.retailer_name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    {kyc.retailer_name || 'Unknown Retailer'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{kyc.phone || 'N/A'}</Typography>
                    <Typography variant="caption">{kyc.email || 'N/A'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{getDocumentStatus(kyc.documents.id_proof)}</TableCell>
                <TableCell>{getDocumentStatus(kyc.documents.address_proof)}</TableCell>
                <TableCell>{getDocumentStatus(kyc.documents.business_license)}</TableCell>
                <TableCell>
                  <Chip
                    label={kyc.kyc_status.toUpperCase()}
                    size="small"
                    color={getStatusColor(kyc.kyc_status)}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, kyc._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const kyc = kycRecords.find((k) => k._id === menuKycId);
            handleViewDetails(kyc);
          }}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleApproveKyc(menuKycId)}>
          <CheckIcon sx={{ mr: 1, fontSize: 18, color: 'success.main' }} /> Approve
        </MenuItem>
        <MenuItem onClick={() => handleRejectKyc(menuKycId)}>
          <RejectIcon sx={{ mr: 1, fontSize: 18, color: 'error.main' }} /> Reject
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>KYC Details</DialogTitle>
        <DialogContent dividers>
          {selectedKyc && (
            <Box sx={{ pt: 2 }}>
              {/* Retailer Info */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                👤 Retailer Information
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Name
                  </Typography>
                  <Typography>{selectedKyc.retailer_name || 'Unknown'}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Email
                  </Typography>
                  <Typography>{selectedKyc.email || 'N/A'}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Phone
                  </Typography>
                  <Typography>{selectedKyc.phone || 'N/A'}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Documents */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                📄 Documents
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                {Object.entries(selectedKyc.documents).map(([key, doc]) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {doc.type}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {doc.number}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {getDocumentStatus(doc)}
                        <IconButton size="small">
                          <DownloadIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* KYC Status */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                ✓ KYC Status
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Status
                  </Typography>
                  <Chip
                    label={selectedKyc.kyc_status.toUpperCase()}
                    size="small"
                    color={getStatusColor(selectedKyc.kyc_status)}
                    variant="filled"
                  />
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Submitted At
                  </Typography>
                  <Typography>
                    {new Date(selectedKyc.submitted_at).toLocaleString()}
                  </Typography>
                </Box>
                {selectedKyc.verified_at && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Verified At
                    </Typography>
                    <Typography>
                      {new Date(selectedKyc.verified_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {selectedKyc.rejection_reason && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Rejection Reason
                    </Typography>
                    <Typography sx={{ color: 'error.main' }}>
                      {selectedKyc.rejection_reason}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          {selectedKyc?.kyc_status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  handleRejectKyc(selectedKyc._id);
                }}
                color="error"
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  handleApproveKyc(selectedKyc._id);
                }}
                variant="contained"
                color="success"
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RetailerKYC;
