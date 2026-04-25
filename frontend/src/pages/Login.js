import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiService';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please enter email and password');
      }

      const response = await authAPI.login(formData.email, formData.password);
      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token || !user) {
        throw new Error('Authentication failed. Please check your credentials.');
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: '#424242',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Locaura Admin
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Control Panel Access
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#757575' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#757575' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 1,
                  background: '#424242',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  '&:hover': {
                    background: '#616161',
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Signing In...
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <Box sx={{ my: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#212121', fontWeight: 'bold' }}>
                📝 Demo Credentials:
              </Typography>
              <Typography variant="body2" sx={{ color: '#212121' }}>
                <strong>Username:</strong> admin
              </Typography>
              <Typography variant="body2" sx={{ color: '#212121' }}>
                <strong>Password:</strong> Admin@1234
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;