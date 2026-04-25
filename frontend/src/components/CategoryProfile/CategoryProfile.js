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
} from '@mui/material';
import {
  Category,
  Description,
  Image,
  Close,
} from '@mui/icons-material';

function CategoryProfile({ category, open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (!category) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Category Details - {category.name}
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
                <Category />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {category.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {category.description || 'No description'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Description />} label="Details" />
            <Tab icon={<Image />} label="Image" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Category Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <Category sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Name" secondary={category.name} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Description sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText primary="Description" secondary={category.description || 'No description'} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <Typography sx={{ mr: 2, color: 'primary.main' }}>ID:</Typography>
                      <ListItemText primary="Category ID" secondary={category._id || category.id} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Additional Info
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Parent Category:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {category.parent_id ? 'Has Parent' : 'Root Category'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Created:</Typography>
                    <Typography>{new Date(category.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Updated:</Typography>
                    <Typography>{new Date(category.updatedAt).toLocaleDateString()}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Category Image
              </Typography>
              {category.image ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} 
                  />
                </Box>
              ) : (
                <Typography color="text.secondary">No image available</Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryProfile;