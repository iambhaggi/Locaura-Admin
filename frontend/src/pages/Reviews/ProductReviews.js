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

const ProductReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppReviews({ limit: 100 });
        setProductReviews(response.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch product reviews:', err);
        setError('Unable to load product reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = productReviews.filter((r) =>
    (r.product_name || r.product_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.consumer_name || r.consumer_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetail = (review) => {
    setSelectedReview(review);
    setOpenDetail(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const totalProductReviews = productReviews.length;
  const avgProductRating = totalProductReviews > 0 ? (productReviews.reduce((a, b) => a + (b.rating || 0), 0) / totalProductReviews).toFixed(1) : '0.0';

  const stats = [
    {
      label: 'Total Reviews',
      value: totalProductReviews,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Avg Rating',
      value: avgProductRating,
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'Total With Images',
      value: productReviews.filter((r) => (r.images || []).length > 0).length,
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

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by product or reviewer name..."
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
              <TableCell sx={{ fontWeight: 'bold' }}>Reviewer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Images</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review._id || review.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {review.product_name || review.product_id || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>{review.consumer_name || review.consumer_id || 'Unknown'}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {review.rating || 0}⭐
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`${(review.images || []).length} images`} size="small" variant="outlined" />
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
                <TableCell colSpan={5} align="center">
                  No product reviews available yet. Reviews will appear here once the database contains them.
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
        <MenuItem onClick={() => handleOpenDetail(selectedReview)}>View Details</MenuItem>
        <MenuItem>Featured Review</MenuItem>
        <MenuItem>Hide Review</MenuItem>
      </Menu>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          Product Review
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{selectedReview.product_name}</Typography>
              <Typography variant="body2">{selectedReview.consumer_name}</Typography>
              <Rating value={selectedReview.rating} readOnly />
              <Typography variant="h6">{selectedReview.title}</Typography>
              <Typography variant="body2">{selectedReview.body}</Typography>
              <Chip label={`${selectedReview.images} images`} size="small" />
              <Typography variant="caption" sx={{ color: '#999' }}>
                {selectedReview.createdAt}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ProductReviews;
