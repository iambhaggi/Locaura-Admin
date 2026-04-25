import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
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
  MenuItem,
  InputAdornment,
  Rating,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { getAppReviews } from '../../api/endpoints';

const StoreReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [storeReviews, setStoreReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppReviews({ limit: 100 });
        setStoreReviews(response.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch store reviews:', err);
        setError('Unable to load store reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = storeReviews.filter((r) => {
    const storeName = (r.store_name || r.store_id || '').toString().toLowerCase();
    const consumerName = (r.consumer_name || r.consumer_id || '').toString().toLowerCase();
    const matchesSearch =
      storeName.includes(searchTerm.toLowerCase()) ||
      consumerName.includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const handleOpenDetail = (review) => {
    setSelectedReview(review);
    setOpenDetail(true);
    setAnchorEl(null);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedReview(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const totalStoreReviews = storeReviews.length;
  const avgStoreRating = totalStoreReviews > 0 ? (storeReviews.reduce((a, b) => a + (b.rating || 0), 0) / totalStoreReviews).toFixed(1) : '0.0';

  const stats = [
    {
      label: 'Total Reviews',
      value: totalStoreReviews,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Avg Rating',
      value: avgStoreRating,
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'With Replies',
      value: storeReviews.filter((r) => r.reply).length,
      bg: '#e8f5e9',
      color: '#4caf50',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ backgroundColor: stat.bg, border: 'none' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h5" style={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by store or reviewer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
        />
        <TextField
          select
          label="Rating"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Ratings</MenuItem>
          <MenuItem value="5">⭐⭐⭐⭐⭐ 5 Stars</MenuItem>
          <MenuItem value="4">⭐⭐⭐⭐ 4 Stars</MenuItem>
          <MenuItem value="3">⭐⭐⭐ 3 Stars</MenuItem>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Store Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reviewer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Review Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Helpful</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review._id || review.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {review.store_name || review.store_id || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>{review.consumer_name || review.consumer_id || 'Unknown'}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {review.rating || 0}⭐
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{review.title || 'No title'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`${review.helpful_votes || 0} votes`} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedReview(review);
                      handleMenuOpen(e);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredReviews.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No store reviews yet. When review data is available in the database, it will appear here.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDetail(selectedReview)}>View Details</MenuItem>
        <MenuItem>Reply</MenuItem>
        <MenuItem>Hide Review</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          Store Review Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Store Name
                </Typography>
                <Typography variant="h6">{selectedReview.store_name}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Reviewer
                  </Typography>
                  <Typography variant="body2">{selectedReview.consumer_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Rating
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Rating value={selectedReview.rating} readOnly />
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Review Title
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {selectedReview.title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Review Body
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                  {selectedReview.body}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Aspects Reviewed
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {selectedReview.aspects.map((aspect, idx) => (
                    <Chip key={idx} label={aspect} size="small" />
                  ))}
                </Box>
              </Box>

              {selectedReview.reply && (
                <Box sx={{ backgroundColor: '#e8f5e9', p: 2, borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    Store Reply
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedReview.reply.text}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default StoreReviews;
