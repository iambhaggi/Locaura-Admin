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
import {
  ApproveReviewDialog,
  HideReviewDialog,
  ReplyReviewDialog,
  DeleteReviewDialog,
} from './ReviewActions';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { getAppReviews } from '../../api/endpoints';

const AllReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openApprove, setOpenApprove] = useState(false);
  const [openHide, setOpenHide] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedReview, setDeletedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppReviews({ limit: 100 });
        setReviews(response.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to fetch reviews from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4caf50';
    if (rating >= 3) return '#ff9800';
    return '#f44336';
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.consumer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleApprove = (reviewId) => {
    setActionMessage(`Review #${reviewId} approved successfully`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleHide = (reviewId, reason) => {
    setActionMessage(`Review #${reviewId} hidden. Reason: ${reason}`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleReply = (reviewId, replyText) => {
    setActionMessage(`Reply posted to review #${reviewId}`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      setDeletedReview(reviewToDelete);
      setIsDeleted(true);
      // In a real app, you would call an API to delete the review
    }
  };

  const handleUndoDelete = () => {
    if (deletedReview) {
      setDeleteDialog(false);
      setDeletedReview(null);
      setReviewToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setReviewToDelete(null);
    }
  };

  const handleDelete = (reviewId) => {
    setActionMessage(`Review #${reviewId} deleted permanently`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((a, b) => a + (b.rating || 0), 0) / totalReviews).toFixed(1) : '0.0';

  const stats = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      bg: '#e3f2fd',
      color: '#1976d2',
    },
    {
      label: 'Avg Rating',
      value: avgRating,
      bg: '#fff3e0',
      color: '#ff9800',
    },
    {
      label: 'Verified Purchases',
      value: reviews.filter((r) => r.is_verified_purchase).length,
      bg: '#e8f5e9',
      color: '#4caf50',
    },
    {
      label: 'Replied Reviews',
      value: reviews.filter((r) => r.reply).length,
      bg: '#fce4ec',
      color: '#c2185b',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
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

      {/* Search & Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by reviewer or product name..."
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
          <MenuItem value="2">⭐⭐ 2 Stars</MenuItem>
          <MenuItem value="1">⭐ 1 Star</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Reviews Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Reviewer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Helpful</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews.map((review) => (
              <TableRow key={review._id || review.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {review.consumer_name || review.consumer_id || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{review.product_name || review.product_id || 'Unknown'}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: getRatingColor(review.rating) }}>
                      {review.rating || 0}⭐
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {review.title || 'No title'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`${review.helpful_votes || 0} votes`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={review.is_hidden ? 'Hidden' : 'Visible'}
                    color={review.is_hidden ? 'error' : 'success'}
                    size="small"
                  />
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
                <TableCell colSpan={7} align="center">
                  No reviews available yet. When review data exists in the database, it will appear here.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleOpenDetail(selectedReview); handleMenuClose(); }}>👁️ View Details</MenuItem>
        <MenuItem onClick={() => { setOpenApprove(true); handleMenuClose(); }}>✓ Approve Review</MenuItem>
        <MenuItem onClick={() => { setOpenHide(true); handleMenuClose(); }}>🙈 Hide Review</MenuItem>
        <MenuItem onClick={() => { setOpenReply(true); handleMenuClose(); }}>💬 Reply to Review</MenuItem>
        <MenuItem onClick={() => { handleDeleteClick(selectedReview); handleMenuClose(); }} sx={{ color: '#f44336' }}>🗑️ Delete Review</MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          Review Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Reviewer
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedReview.consumer_name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Product
                </Typography>
                <Typography variant="body2">{selectedReview.product_name}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Rating
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Rating value={selectedReview.rating} readOnly />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedReview.rating} out of 5
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Date
                  </Typography>
                  <Typography variant="body2">{selectedReview.createdAt}</Typography>
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

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Verified Purchase
                  </Typography>
                  <Chip
                    label={selectedReview.is_verified_purchase ? 'Yes' : 'No'}
                    color={selectedReview.is_verified_purchase ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Helpful Votes
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                    {selectedReview.helpful_votes}
                  </Typography>
                </Box>
              </Box>

              {selectedReview.reply && (
                <Box sx={{ backgroundColor: '#e8f5e9', p: 2, borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    Seller Reply
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedReview.reply.text}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                    Replied on {selectedReview.reply.replied_at}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Message */}
      {actionMessage && (
        <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <Alert severity="success" onClose={() => setActionMessage('')}>
            {actionMessage}
          </Alert>
        </Box>
      )}

      {/* Action Dialogs */}
      <ApproveReviewDialog
        open={openApprove}
        review={selectedReview}
        onClose={() => {
          setOpenApprove(false);
          handleMenuClose();
        }}
        onApprove={handleApprove}
      />

      <HideReviewDialog
        open={openHide}
        review={selectedReview}
        onClose={() => {
          setOpenHide(false);
          handleMenuClose();
        }}
        onHide={handleHide}
      />

      <ReplyReviewDialog
        open={openReply}
        review={selectedReview}
        onClose={() => {
          setOpenReply(false);
          handleMenuClose();
        }}
        onReply={handleReply}
      />

      <DeleteReviewDialog
        open={openDelete}
        review={selectedReview}
        onClose={() => {
          setOpenDelete(false);
          handleMenuClose();
        }}
        onDelete={handleDelete}
      />

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Review"
        description="This review will be deleted. You have 10 seconds to undo this action."
        itemName={reviewToDelete?.title || 'Review'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default AllReviews;
