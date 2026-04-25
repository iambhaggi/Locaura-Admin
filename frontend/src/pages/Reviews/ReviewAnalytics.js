import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, CircularProgress, Alert } from '@mui/material';
import { getAppReviews } from '../../api/endpoints';

const ReviewAnalytics = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAppReviews({ limit: 200 });
        setReviews(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load review analytics:', err);
        setError('Unable to load review analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews).toFixed(1) : '0.0';
  const fiveStarCount = reviews.filter((review) => review.rating === 5).length;
  const oneStarCount = reviews.filter((review) => review.rating === 1).length;
  const fiveStarPercent = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0;
  const oneStarPercent = totalReviews > 0 ? Math.round((oneStarCount / totalReviews) * 100) : 0;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Review Analytics
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Reviews</Typography>
                <Typography variant="h4">{totalReviews}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Avg Rating</Typography>
                <Typography variant="h4" sx={{ color: '#f57c00' }}>
                  {avgRating}★
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">5 Star</Typography>
                <Typography variant="h4" sx={{ color: '#388e3c' }}>
                  {fiveStarCount} ({fiveStarPercent}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">1 Star</Typography>
                <Typography variant="h4" sx={{ color: '#d32f2f' }}>
                  {oneStarCount} ({oneStarPercent}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ReviewAnalytics;
