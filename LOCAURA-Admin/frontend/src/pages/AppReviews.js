import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  Rating,
} from '@mui/material';
import {
  MoreVert,
  Search,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Add,
  Refresh,
} from '@mui/icons-material';
import { getAppReviews } from '../api/endpoints';
import ReviewProfile from '../components/ReviewProfile/ReviewProfile';

const AppReviews = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const detailId = searchParams.get('id');
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [selectedReviewProfile, setSelectedReviewProfile] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        search: searchTerm || undefined,
      };
      const response = await getAppReviews(params);
      setReviews(response.data?.data || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, searchTerm]);

  // Handle opening detail view from URL parameter
  useEffect(() => {
    if (detailId && reviews.length > 0) {
      const review = reviews.find(r => r._id === detailId || r.id === detailId);
      if (review) {
        setSelectedReviewProfile(review);
        setProfileDialog(true);
      }
    }
  }, [detailId, reviews]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleCloseDetail = () => {
    setProfileDialog(false);
    setSelectedReviewProfile(null);
    navigate('/reviews');
  };

  const handleViewDetails = (review) => {
    setSelectedReviewProfile(review);
    setProfileDialog(true);
    handleMenuClose();
  };

  const handleStatusChange = (reviewId, newStatus) => {
    setReviews(reviews.map(review => 
      (review._id || review.id) === reviewId ? { ...review, is_hidden: newStatus === 'hidden' } : review
    ));
    handleMenuClose();
  };

  const displayReviews = reviews;

  if (loading && reviews.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          App Reviews
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchReviews}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Typography variant="body2" color="text.secondary">
              {displayReviews.length} reviews
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rating</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Verified Purchase</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Helpful Votes</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayReviews.map((review) => (
                  <TableRow key={review._id || review.id}>
                    <TableCell>
                      <Rating value={review.rating || 0} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {review.title || 'No title'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.is_verified_purchase ? 'Verified' : 'Unverified'}
                        color={review.is_verified_purchase ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.is_hidden ? 'Hidden' : 'Visible'}
                        color={review.is_hidden ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {review.helpful_votes || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, review)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {reviews.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                No reviews found yet. When reviews are added to the database, they will appear here.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedReview)}>
          <CheckCircle sx={{ mr: 1, color: 'primary.main' }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedReview?._id || selectedReview?.id, 'visible')}>
          <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
          Show Review
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedReview?._id || selectedReview?.id, 'hidden')}>
          <Block sx={{ mr: 1, color: 'error.main' }} />
          Hide Review
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Delete sx={{ mr: 1, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>

      <ReviewProfile 
        review={selectedReviewProfile} 
        open={profileDialog} 
        onClose={handleCloseDetail} 
      />    </Box>
  );
};

export default AppReviews;