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

const drawerWidth = 280;

function Layout({ children }) {
  const [anchorEl, setAnchorEl] = useState(null);
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
      background: '#f5f5f5',
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
          elevation={1}
          sx={{ 
            background: '#ffffff',
            borderBottom: '1px solid #e0e0e0',
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
              <IconButton sx={{ 
                color: '#757575',
                '&:hover': {
                  background: '#f5f5f5',
                },
              }}>
                <Badge badgeContent={4} color="error">
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
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}>
          {children}
        </Box>
      </Box>

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