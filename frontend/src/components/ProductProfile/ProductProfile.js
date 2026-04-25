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
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Inventory,
  Description,
  Image,
  Close,
} from '@mui/icons-material';

function ProductProfile({ product, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Product Details - {product.name}
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
                <Inventory />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {product.brand}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={product.status} 
                  color={getStatusColor(product.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  ₹{product.base_price}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Description />} label="Details" />
            <Tab icon={<Image />} label="Images" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Product Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Inventory sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Name" secondary={product.name} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Slug:</Typography>
                      <ListItemText primary="Slug" secondary={product.slug || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Brand:</Typography>
                      <ListItemText primary="Brand" secondary={product.brand || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Categories:</Typography>
                      <ListItemText primary="Categories" secondary={product.categories?.join(', ') || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Description sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Description" secondary={product.description || 'No description'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Gender:</Typography>
                      <ListItemText primary="Gender" secondary={product.gender || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Tags:</Typography>
                      <ListItemText primary="Tags" secondary={product.tags?.join(', ') || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Featured:</Typography>
                      <ListItemText primary="Featured" secondary={product.is_featured ? 'Yes' : 'No'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Pricing & Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Base Price:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{product.base_price}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Compare at Price:</Typography>
                    <Typography>₹{product.base_compare_at_price || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Status:</Typography>
                    <Chip label={product.status} color={getStatusColor(product.status)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Stock:</Typography>
                    <Typography>{product.total_stock || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Colors:</Typography>
                    <Typography>{product.color_count != null ? product.color_count : 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Rating:</Typography>
                    <Typography>{product.rating != null ? `${product.rating}/5` : 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Reviews:</Typography>
                    <Typography>{product.total_reviews != null ? product.total_reviews : 'N/A'}</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Attributes & Images
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Images:</Typography>
                      <ListItemText primary="Cover image count" secondary={product.cover_images?.length || 0} />
                    </ListItem>
                    {product.product_attributes?.length > 0 ? (
                      product.product_attributes.map((attr, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <Typography sx={{ mr: 2, color: 'primary.main' }}>{attr.name}:</Typography>
                          <ListItemText primary={attr.value || 'N/A'} />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Attributes" secondary="No additional attributes" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Product Images
              </Typography>
              {product.cover_images?.length > 0 ? (
                <ImageList sx={{ width: '100%', height: 300 }} cols={3} rowHeight={164}>
                  {product.cover_images.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography color="text.secondary">No images available</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default ProductProfile;