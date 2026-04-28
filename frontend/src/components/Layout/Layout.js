import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  KeyboardArrowDown,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../Sidebar/AdminSidebar';
import { getNotifications } from '../../api/endpoints';

const drawerWidth = 280;

function Layout({ children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const normalizeNotification = (notif) => ({
    id: notif._id || notif.id || String(Math.random()),
    title: notif.title || notif.subject || 'Notification',
    message: notif.body || notif.message || 'No details available.',
    createdAt: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '',
    isRead: notif.is_read,
  });

  const handleNotificationsOpen = async (event) => {
    setNotificationAnchorEl(event.currentTarget);
    setLoadingNotifications(true);

    try {
      const response = await getNotifications({ limit: 5 });
      const items = response.data?.data || [];
      setNotifications(items.map(normalizeNotification));
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
  };

  const unreadCount = notifications.filter((notif) => notif.isRead === false).length;

  const handleLogout = () => {
    handleProfileMenuClose();
    // Clear token from localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const handleMobileDrawerOpen = () => {
    setMobileDrawerOpen(true);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  // Extract page title from pathname
  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard';
    
    // Format the segment to title case
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #eef5ff 0%, #f8fbff 55%, #eef4ff 100%)',
    }}>
      {/* Sidebar - Fixed */}
      {!isMobile && (
        <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
          <AdminSidebar 
            open={mobileDrawerOpen} 
            onClose={handleMobileDrawerClose} 
          />
        </Box>
      )}
      
      {isMobile && (
        <AdminSidebar 
          open={mobileDrawerOpen} 
          onClose={handleMobileDrawerClose} 
        />
      )}

      {/* Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        background: 'transparent',
        minHeight: '100vh',
        width: '100%',
      }}>
        {/* Top Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
            boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton 
                  onClick={handleMobileDrawerOpen}
                  sx={{ color: '#212121' }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#212121',
              }}>
                {getPageTitle()}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handleNotificationsOpen}
                sx={{ 
                  color: '#757575',
                  '&:hover': {
                    background: '#f5f5f5',
                  },
                }}
              >
                <Badge badgeContent={unreadCount || 0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <Button
                onClick={handleProfileMenuOpen}
                sx={{
                  color: '#212121',
                  background: '#f5f5f5',
                  borderRadius: 1,
                  px: 2,
                  '&:hover': {
                    background: '#e0e0e0',
                  },
                }}
                startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: '#2196F3' }}>A</Avatar>}
                endIcon={<KeyboardArrowDown />}
              >
                Admin
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ 
          p: 4,
          background: 'transparent',
          minHeight: 'calc(100vh - 64px)',
          maxWidth: '1440px',
          mx: 'auto',
        }}>
          {children}
        </Box>
      </Box>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.25)',
            minWidth: 320,
            maxWidth: 360,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Recent Alerts
          </Typography>
          <Button
            size="small"
            onClick={() => {
              handleNotificationsClose();
              navigate('/notifications');
            }}
          >
            View all
          </Button>
        </Box>
        <Divider />

        {loadingNotifications && (
          <MenuItem disabled>
            Loading recent notifications...
          </MenuItem>
        )}

        {!loadingNotifications && notifications.length === 0 && (
          <MenuItem disabled>
            No notifications available right now.
          </MenuItem>
        )}

        {!loadingNotifications && notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={handleNotificationsClose}
            sx={{ alignItems: 'flex-start', py: 1.5 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'normal' }}>
                {notification.message}
              </Typography>
              {notification.createdAt && (
                <Typography variant="caption" color="text.disabled">
                  {notification.createdAt}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>👤 Profile</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>⚙️ Account Settings</MenuItem>
        <MenuItem onClick={handleLogout}>🚪 Logout</MenuItem>
      </Menu>
    </Box>
  );
}

export default Layout;