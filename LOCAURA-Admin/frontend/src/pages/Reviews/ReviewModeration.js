import React, { useState, useEffect } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, MenuItem, Menu, Button, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAppReviews } from '../../api/endpoints';

const ReviewModeration = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [anchorEl, setAnchorEl] = useState(null);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppReviews({ limit: 100 });
        const reviews = response.data?.data || [];
        const mappedReviews = reviews.map((review) => ({
          _id: review._id,
          product_name: review.product_name || review.product_id || review.title || 'Unknown Product',
          reason: review.is_hidden ? 'Hidden by moderation' : 'Pending moderation',
          status: review.is_hidden ? 'rejected' : 'pending',
          flag_date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A',
          content: review.body || review.title || '',
          reviewer: review.consumer_name || review.consumer_id || 'Unknown',
        }));
        setFlaggedReviews(mappedReviews);
      } catch (err) {
        console.error('Failed to fetch moderation reviews:', err);
        setError('Unable to load moderation review data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = flaggedReviews.filter((r) => {
    const matchesSearch =
      (r.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reviewer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Pending Review', value: flaggedReviews.filter((r) => r.status === 'pending').length, bg: '#fff3e0', color: '#ff9800' },
    { label: 'Approved', value: flaggedReviews.filter((r) => r.status === 'approved').length, bg: '#e8f5e9', color: '#4caf50' },
    { label: 'Rejected', value: flaggedReviews.filter((r) => r.status === 'rejected').length, bg: '#ffebee', color: '#f44336' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ backgroundColor: stat.bg, border: 'none' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>{stat.label}</Typography>
                <Typography variant="h5" style={{ color: stat.color }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField placeholder="Search flagged reviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} size="small" sx={{ flex: 1, minWidth: 250 }} />
        <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Flagged</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review._id || review.id} hover>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{review.product_name}</Typography></TableCell>
                <TableCell>{review.reason}</TableCell>
                <TableCell>
                  <Chip label={review.status.toUpperCase()} color={review.status === 'pending' ? 'warning' : review.status === 'approved' ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell><Typography variant="caption">{review.flag_date}</Typography></TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton size="small" onClick={(e) => { setSelectedReview(review); setAnchorEl(e.currentTarget); }}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredReviews.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No moderation reviews available. When review data exists in the database, it will appear here.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setOpenDetail(true)}>View Details</MenuItem>
        <MenuItem>Approve</MenuItem>
        <MenuItem>Reject</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Moderation Review</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box><Typography variant="caption" sx={{ color: '#999' }}>Product</Typography><Typography variant="h6">{selectedReview.product_name}</Typography></Box>
              <Box><Typography variant="caption" sx={{ color: '#999' }}>Reason</Typography><Typography variant="body2">{selectedReview.reason}</Typography></Box>
              <Box><Typography variant="caption" sx={{ color: '#999' }}>Review Content</Typography><Typography variant="body2">{selectedReview.content}</Typography></Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>Approve</Button>
                <Button variant="outlined" color="error" startIcon={<CancelIcon />}>Reject</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ReviewModeration;
