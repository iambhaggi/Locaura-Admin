import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Rating,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Star,
  Comment,
  Image,
  Close,
} from '@mui/icons-material';

function ReviewProfile({ review, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!review) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Review Details
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, backgroundColor: 'primary.main' }}>
                <Star />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {review.title || 'Review'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Consumer ID: {review.consumer_id}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Comment />} label="Review" />
            <Tab icon={<Image />} label="Images" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Review Content
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Rating value={review.rating} readOnly />
                  </Box>
                  {review.title && (
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {review.title}
                    </Typography>
                  )}
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {review.body}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={review.is_verified_purchase ? 'Verified Purchase' : 'Unverified'} 
                      color={review.is_verified_purchase ? 'success' : 'warning'} 
                      size="small" 
                    />
                    <Chip 
                      label={review.is_hidden ? 'Hidden' : 'Visible'} 
                      color={review.is_hidden ? 'error' : 'success'} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Helpful votes: {review.helpful_votes || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Review Details
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Order ID:</Typography>
                      <ListItemText primary="" secondary={review.order_id} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Store ID:</Typography>
                      <ListItemText primary="" secondary={review.store_id} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Consumer ID:</Typography>
                      <ListItemText primary="" secondary={review.consumer_id} />
                    </ListItem>
                    {review.product_id && (
                      <ListItem sx={{ px: 0 }}>
                        <Typography sx={{ mr: 2, color: 'primary.main' }}>Product ID:</Typography>
                        <ListItemText primary="" secondary={review.product_id} />
                      </ListItem>
                    )}
                    {review.rider_id && (
                      <ListItem sx={{ px: 0 }}>
                        <Typography sx={{ mr: 2, color: 'primary.main' }}>Rider ID:</Typography>
                        <ListItemText primary="" secondary={review.rider_id} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
              {review.reply && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Admin Reply
                    </Typography>
                    <Typography variant="body2">
                      {review.reply.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Replied on {new Date(review.reply.replied_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Review Images
              </Typography>
              {review.images?.length > 0 ? (
                <ImageList sx={{ width: '100%', height: 300 }} cols={3} rowHeight={164}>
                  {review.images.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography color="text.secondary">No images attached</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewProfile;