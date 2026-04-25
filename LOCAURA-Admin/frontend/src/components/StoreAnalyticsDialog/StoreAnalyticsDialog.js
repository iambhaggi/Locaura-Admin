import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close,
  Visibility,
  TouchApp,
  TrendingUp,
  People,
  Schedule,
  LocationOn,
  DeviceHub,
} from '@mui/icons-material';

const StoreAnalyticsDialog = ({ open, store, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && store) {
      setLoading(true);
      setTimeout(() => {
        const data = {
          overview: {
            totalViews: Math.floor(Math.random() * 10000) + 5000,
            uniqueVisitors: Math.floor(Math.random() * 5000) + 2000,
            totalClicks: Math.floor(Math.random() * 2000) + 800,
            conversionRate: (Math.random() * 5 + 2).toFixed(2),
            bounceRate: (Math.random() * 30 + 20).toFixed(1),
            avgSessionDuration: Math.floor(Math.random() * 300) + 120,
          },
          traffic: {
            sources: [
              { source: 'Direct', visits: 1245, percentage: 35.2 },
              { source: 'Search', visits: 987, percentage: 27.9 },
              { source: 'Social Media', visits: 654, percentage: 18.5 },
              { source: 'Referral', visits: 432, percentage: 12.2 },
              { source: 'Email', visits: 218, percentage: 6.2 },
            ],
            devices: [
              { device: 'Mobile', users: 2156, percentage: 68.4 },
              { device: 'Desktop', users: 743, percentage: 23.6 },
              { device: 'Tablet', users: 252, percentage: 8.0 },
            ],
            locations: [
              { city: 'Mumbai', users: 1245, orders: 89 },
              { city: 'Delhi', users: 987, orders: 67 },
              { city: 'Bangalore', users: 743, orders: 52 },
              { city: 'Chennai', users: 521, orders: 38 },
              { city: 'Pune', users: 398, orders: 29 },
            ]
          },
          behavior: {
            popularPages: [
              { page: 'Store Homepage', views: 3456, avgTime: '2:34' },
              { page: 'Product Catalog', views: 2987, avgTime: '3:12' },
              { page: 'Product Details', views: 2134, avgTime: '1:45' },
              { page: 'About Store', views: 876, avgTime: '1:23' },
              { page: 'Contact', views: 543, avgTime: '0:56' },
            ],
            searchTerms: [
              { term: 'organic rice', searches: 234, results: 12 },
              { term: 'fresh vegetables', searches: 198, results: 45 },
              { term: 'dairy products', searches: 156, results: 23 },
              { term: 'spices', searches: 134, results: 67 },
              { term: 'fruits', searches: 98, results: 34 },
            ]
          },
          timeAnalysis: {
            hourly: [
              { hour: '6-9 AM', visits: 234, orders: 12 },
              { hour: '9-12 PM', visits: 456, orders: 23 },
              { hour: '12-3 PM', visits: 678, orders: 34 },
              { hour: '3-6 PM', visits: 543, orders: 28 },
              { hour: '6-9 PM', visits: 789, orders: 45 },
              { hour: '9-12 AM', visits: 321, orders: 18 },
            ],
            weekly: [
              { day: 'Monday', visits: 456, orders: 23, revenue: 3450 },
              { day: 'Tuesday', visits: 523, orders: 28, revenue: 4200 },
              { day: 'Wednesday', visits: 398, orders: 19, revenue: 2850 },
              { day: 'Thursday', visits: 612, orders: 31, revenue: 4650 },
              { day: 'Friday', visits: 734, orders: 42, revenue: 6300 },
              { day: 'Saturday', visits: 891, orders: 56, revenue: 8400 },
              { day: 'Sunday', visits: 678, orders: 38, revenue: 5700 },
            ]
          }
        };
        setAnalyticsData(data);
        setLoading(false);
      }, 1500);
    }
  }, [open, store]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!store) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Store Analytics: {store.store_name}</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>Loading Analytics Data...</Typography>
            <LinearProgress />
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Overview" />
              <Tab label="Traffic Sources" />
              <Tab label="User Behavior" />
              <Tab label="Time Analysis" />
            </Tabs>

            {/* Overview Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Analytics Overview</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Visibility sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle2">Total Views</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                          {analyticsData.overview.totalViews.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last 30 days
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <People sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="subtitle2">Unique Visitors</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                          {analyticsData.overview.uniqueVisitors.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Individual users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TouchApp sx={{ mr: 1, color: 'warning.main' }} />
                          <Typography variant="subtitle2">Total Clicks</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                          {analyticsData.overview.totalClicks.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click-through rate: {analyticsData.overview.conversionRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Schedule sx={{ mr: 1, color: 'info.main' }} />
                          <Typography variant="subtitle2">Avg Session</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                          {Math.floor(analyticsData.overview.avgSessionDuration / 60)}:{(analyticsData.overview.avgSessionDuration % 60).toString().padStart(2, '0')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bounce rate: {analyticsData.overview.bounceRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Traffic Sources Tab */}
            {tabValue === 1 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Traffic Sources</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Source</TableCell>
                            <TableCell align="right">Visits</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                            <TableCell align="right">Visual</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsData.traffic.sources.map((source, index) => (
                            <TableRow key={index}>
                              <TableCell>{source.source}</TableCell>
                              <TableCell align="right">{source.visits}</TableCell>
                              <TableCell align="right">{source.percentage}%</TableCell>
                              <TableCell align="right">
                                <LinearProgress 
                                  variant="determinate" 
                                  value={source.percentage * 2.5} 
                                  sx={{ width: 60, height: 6, borderRadius: 3 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Device Usage</Typography>
                    <Grid container spacing={2}>
                      {analyticsData.traffic.devices.map((device, index) => (
                        <Grid item xs={12} key={index}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1">{device.device}</Typography>
                                <Typography variant="h6">{device.percentage}%</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {device.users.toLocaleString()} users
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={device.percentage} 
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Top Locations</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>City</TableCell>
                        <TableCell align="right">Users</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Conversion Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.traffic.locations.map((location, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                              {location.city}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{location.users}</TableCell>
                          <TableCell align="right">{location.orders}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${((location.orders / location.users) * 100).toFixed(1)}%`}
                              color={((location.orders / location.users) * 100) > 5 ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* User Behavior Tab */}
            {tabValue === 2 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Popular Pages</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Page</TableCell>
                            <TableCell align="right">Views</TableCell>
                            <TableCell align="right">Avg Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsData.behavior.popularPages.map((page, index) => (
                            <TableRow key={index}>
                              <TableCell>{page.page}</TableCell>
                              <TableCell align="right">{page.views}</TableCell>
                              <TableCell align="right">{page.avgTime}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Search Terms</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Search Term</TableCell>
                            <TableCell align="right">Searches</TableCell>
                            <TableCell align="right">Results</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsData.behavior.searchTerms.map((term, index) => (
                            <TableRow key={index}>
                              <TableCell>{term.term}</TableCell>
                              <TableCell align="right">{term.searches}</TableCell>
                              <TableCell align="right">{term.results}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Time Analysis Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Hourly Traffic Pattern</Typography>
                <Grid container spacing={1} sx={{ mb: 4 }}>
                  {analyticsData.timeAnalysis.hourly.map((hour, index) => (
                    <Grid item xs={2} key={index}>
                      <Card sx={{ textAlign: 'center', minHeight: 120 }}>
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {hour.hour}
                          </Typography>
                          <Typography variant="h6" sx={{ fontSize: '1rem', my: 1 }}>
                            {hour.visits}
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            {hour.orders} orders
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(hour.visits / Math.max(...analyticsData.timeAnalysis.hourly.map(h => h.visits))) * 100}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="h6" gutterBottom>Weekly Performance</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell align="right">Visits</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Conversion</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.timeAnalysis.weekly.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{day.day}</TableCell>
                          <TableCell align="right">{day.visits}</TableCell>
                          <TableCell align="right">{day.orders}</TableCell>
                          <TableCell align="right">₹{day.revenue.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${((day.orders / day.visits) * 100).toFixed(1)}%`}
                              color={((day.orders / day.visits) * 100) > 5 ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained">Export Analytics</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreAnalyticsDialog;