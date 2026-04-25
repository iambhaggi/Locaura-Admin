import React, { useEffect, useState } from 'react';
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
  Button,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { storesAPI } from '../../services/apiService';

const StoreBankDetails = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBankDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await storesAPI.getAll();
        const stores = response?.data?.data || response?.data || [];
        const mapped = stores.map((store) => ({
          _id: store._id,
          store_name: store.store_name || '-',
          account_holder_name: store.bank_details?.account_holder_name || '-',
          account_number: store.bank_details?.account_number || '',
          ifsc_code: store.bank_details?.ifsc_code || '-',
          bank_name: store.bank_details?.bank_name || '-',
          account_type: store.bank_details?.account_type || 'Current',
          branch: store.bank_details?.branch || '-',
          gstin: store.gstin || '-',
          fssai_license: store.fssai_license || '-',
          verified: Boolean(store.bank_details?.account_number && store.bank_details?.ifsc_code),
        }));
        setBankDetails(mapped);
      } catch (err) {
        setError('Failed to fetch store bank details');
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  const handleViewDetails = (bank) => {
    setSelectedBank(bank);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedBank(null);
  };

  const handleVerifyAccount = (bankId) => {
    setBankDetails(
      bankDetails.map((bank) =>
        bank._id === bankId ? { ...bank, verified: true } : bank
      )
    );
    if (selectedBank && selectedBank._id === bankId) {
      setSelectedBank({ ...selectedBank, verified: true });
    }
  };

  const filteredBankDetails = bankDetails.filter((bank) =>
    (bank.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bank.account_number || '').includes(searchTerm) ||
    (bank.ifsc_code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maskAccountNumber = (account) => {
    if (!account) return '-';
    if (account.length <= 4) return account;
    return `****${account.slice(-4)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        🏦 Store Bank Details
      </Typography>

      {loading && <Typography sx={{ mb: 2 }}>Loading bank details...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by store name, account number, or IFSC..."
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
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Account Holder</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Account Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bank & IFSC</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Account Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Verified</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredBankDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No bank details found
                </TableCell>
              </TableRow>
            )}
            {filteredBankDetails.map((bank) => (
              <TableRow key={bank._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                      {bank.store_name.charAt(0)}
                    </Avatar>
                    {bank.store_name}
                  </Box>
                </TableCell>
                <TableCell>{bank.account_holder_name}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {maskAccountNumber(bank.account_number)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption">{bank.bank_name}</Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {bank.ifsc_code}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={bank.account_type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {bank.verified ? (
                    <Chip
                      label="Verified"
                      size="small"
                      icon={<VerifiedIcon />}
                      color="success"
                      variant="filled"
                    />
                  ) : (
                    <Chip label="Pending" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(bank)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bank Account Details</DialogTitle>
        <DialogContent dividers>
          {selectedBank && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🏢 Store Information
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Store Name
                  </Typography>
                  <Typography>{selectedBank.store_name}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                🏦 Bank Account Details
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Account Holder Name
                  </Typography>
                  <Typography>{selectedBank.account_holder_name}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Account Number
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace' }}>
                    {selectedBank.account_number}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Account Type
                  </Typography>
                  <Typography>{selectedBank.account_type}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Bank Name
                  </Typography>
                  <Typography>{selectedBank.bank_name}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    IFSC Code
                  </Typography>
                  <Typography>{selectedBank.ifsc_code}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Branch
                  </Typography>
                  <Typography>{selectedBank.branch}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                📋 Tax & Compliance
              </Typography>
              <Box sx={{ mb: 3, pl: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    GSTIN
                  </Typography>
                  <Typography>{selectedBank.gstin}</Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    FSSAI License
                  </Typography>
                  <Typography>{selectedBank.fssai_license}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                ✓ Verification Status
              </Typography>
              <Box sx={{ pl: 2 }}>
                {selectedBank.verified ? (
                  <Chip
                    label="Account Verified"
                    icon={<VerifiedIcon />}
                    color="success"
                    variant="filled"
                  />
                ) : (
                  <Chip label="Pending Verification" variant="outlined" />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          {selectedBank && !selectedBank.verified && (
            <Button
              onClick={() => handleVerifyAccount(selectedBank._id)}
              variant="contained"
              color="success"
            >
              Verify Account
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreBankDetails;
