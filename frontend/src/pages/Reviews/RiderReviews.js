import React, { useState, useEffect } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Grid, Card, CardContent, Typography, Chip, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, Rating, Menu, MenuItem, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getAppReviews } from '../../api/endpoints';

const RiderReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [riderReviews, setRiderReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppReviews({ limit: 100 });
        setRiderReviews(response.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch rider reviews:', err);
        setError('Unable to load rider reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = riderReviews.filter((r) =>
    (r.rider_name || r.rider_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRiderReviews = riderReviews.length;
  const avgRiderRating = totalRiderReviews > 0 ? (riderReviews.reduce((a, b) => a + (b.rating || 0), 0) / totalRiderReviews).toFixed(1) : '0.0';

  const stats = [
    { label: 'Total Reviews', value: totalRiderReviews, bg: '#e3f2fd', color: '#1976d2' },
    { label: 'Avg Rating', value: avgRiderRating, bg: '#fff3e0', color: '#ff9800' },
    { label: 'High Rated (4+)', value: riderReviews.filter((r) => (r.rating || 0) >= 4).length, bg: '#e8f5e9', color: '#4caf50' },
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

      <Box sx={{ mb: 3 }}>
        <TextField placeholder="Search by rider name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} size="small" sx={{ flex: 1, minWidth: 250 }} />
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
              <TableCell sx={{ fontWeight: 'bold' }}>Rider Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Helpful</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review._id || review.id} hover>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{review.rider_name || review.rider_id || 'Unknown'}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{review.rating || 0}⭐</Typography></TableCell>
                <TableCell>{review.title || 'No title'}</TableCell>
                <TableCell><Chip label={`${review.helpful_votes || 0} votes`} size="small" variant="outlined" /></TableCell>
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
                  No rider reviews available yet. Reviews will appear here once data exists in the database.
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
        <MenuItem>Hide Review</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Rider Review</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{selectedReview.rider_name}</Typography>
              <Rating value={selectedReview.rating} readOnly />
              <Typography variant="h6">{selectedReview.title}</Typography>
              <Typography variant="caption">{selectedReview.createdAt}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RiderReviews;
