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
  ImageListItemBar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  Store,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  DeliveryDining,
  MonetizationOn,
  Star,
  Image,
  Close,
  Business,
  Category,
  Info,
} from '@mui/icons-material';

function StoreProfile({ store, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatBusinessHours = (hours) => {
    if (!hours || !Array.isArray(hours)) return 'Not available';

    const dayNames = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    return hours.map(hour => {
      const dayName = dayNames[hour.day] || hour.day;
      if (!hour.is_open) return `${dayName}: Closed`;
      return `${dayName}: ${hour.open} - ${hour.close}`;
    }).join(', ');
  };

  if (!store) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Store Profile - {store.store_name}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80 }} src={store.logo_url}>
                <Store sx={{ fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {store.store_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {store.store_email} • {store.store_phone}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={store.status}
                  color={getStatusColor(store.status)}
                  size="small"
                />
                <Chip
                  label={store.is_active ? 'Active' : 'Inactive'}
                  color={store.is_active ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  label={store.business_type}
                  variant="outlined"
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Rating value={store.rating || 0} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({store.total_reviews || 0} reviews)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Info />} label="Details" />
            <Tab icon={<Business />} label="Business Info" />
            <Tab icon={<Image />} label="Images" />
            <Tab icon={<AccessTime />} label="Hours" />
          </Tabs>
        </Box>

        {/* Details Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Store Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Store sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Store Name" secondary={store.store_name} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Slug:</Typography>
                      <ListItemText primary="Slug" secondary={store.slug || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Business sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Business Type" secondary={store.business_type || 'N/A'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Email" secondary={store.store_email} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Phone" secondary={store.store_phone} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>GSTIN:</Typography>
                      <ListItemText primary="GSTIN" secondary={store.gstin || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>FSSAI License:</Typography>
                      <ListItemText primary="FSSAI License" secondary={store.fssai_license || 'Not provided'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Bank Details:</Typography>
                      <ListItemText primary="Bank Details" secondary={store.bank_details ? 'Configured' : 'Not configured'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Address & Location
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary="Address"
                        secondary={
                          store.address ? (
                            <Box>
                              {store.address.shop_number && <div>{store.address.shop_number}</div>}
                              {store.address.building_name && <div>{store.address.building_name}</div>}
                              <div>{store.address.street}</div>
                              <div>{store.address.city}, {store.address.state} {store.address.zip_code}</div>
                              {store.address.landmark && <div>Landmark: {store.address.landmark}</div>}
                            </Box>
                          ) : 'Not provided'
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Coordinates:</Typography>
                      <ListItemText
                        primary="Location"
                        secondary={
                          store.location?.coordinates ?
                            `${store.location.coordinates[1]}, ${store.location.coordinates[0]}` :
                            'Not available'
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Performance
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Rating:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={store.rating || 0} readOnly size="small" />
                      <Typography sx={{ ml: 1 }}>{store.rating || 0}/5</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Total Reviews:</Typography>
                    <Typography>{store.total_reviews || 0}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Business Info Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery & Orders
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <DeliveryDining sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary="Delivery Available"
                        secondary={store.is_delivery_available ? 'Yes' : 'No'}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Delivery Radius:</Typography>
                      <ListItemText primary="Delivery Radius" secondary={`${store.delivery_radius_km || 0} km`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <MonetizationOn sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Minimum Order" secondary={`₹${store.min_order_amount || 0}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Delivery Fee:</Typography>
                      <ListItemText primary="Delivery Fee" secondary={`₹${store.delivery_fee || 0}`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Categories & Description
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Category sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary="Categories"
                        secondary={store.categories?.join(', ') || 'No categories'}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Description:</Typography>
                      <ListItemText primary="Description" secondary={store.description || 'No description'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Social Links
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>Instagram:</Typography>
                      <ListItemText
                        primary="Instagram"
                        secondary={store.social_links?.instagram || 'Not provided'}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>WhatsApp:</Typography>
                      <ListItemText
                        primary="WhatsApp"
                        secondary={store.social_links?.whatsapp || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Images Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Store Images
                  </Typography>
                  {store.store_images?.length > 0 ? (
                    <ImageList sx={{ width: '100%', height: 400 }} cols={3} rowHeight={164}>
                      {store.store_images.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={image}
                            alt={`Store image ${index + 1}`}
                            loading="lazy"
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Typography color="text.secondary">No store images available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            {store.logo_url && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Logo
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={store.logo_url}
                        alt="Store logo"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {store.banner_url && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Banner
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={store.banner_url}
                        alt="Store banner"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Hours Tab */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Business Hours
              </Typography>
              {store.business_hours?.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Open Time</TableCell>
                        <TableCell>Close Time</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {store.business_hours.map((hour, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {hour.day}
                          </TableCell>
                          <TableCell>{!hour.is_closed ? hour.open : '-'}</TableCell>
                          <TableCell>{!hour.is_closed ? hour.close : '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={!hour.is_closed ? 'Open' : 'Closed'}
                              color={!hour.is_closed ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">Business hours not available</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default StoreProfile;