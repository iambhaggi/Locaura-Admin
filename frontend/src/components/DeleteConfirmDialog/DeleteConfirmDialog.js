import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import { Delete, Undo } from '@mui/icons-material';

/**
 * DeleteConfirmDialog - Professional delete confirmation with undo capability
 * 
 * Props:
 *   - open: boolean - Dialog visibility
 *   - title: string - What's being deleted  
 *   - description: string - Deletion warning message
 *   - itemName: string - Name of item to display
 *   - onConfirm: function - Called when user confirms delete
 *   - onCancel: function - Called when user cancels
 *   - loading: boolean - Show loading state
 *   - isDeleted: boolean - Show success state after deletion
 *   - onUndo: function - Called when user clicks undo
 *   - timeout: number - Timeout in seconds (default: 10)
 */
const DeleteConfirmDialog = ({
  open,
  title = 'Delete Item',
  description,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
  isDeleted = false,
  onUndo,
  timeout = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeout);
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // Use dynamic description if not provided
  const defaultDescription = `This action cannot be undone directly, but you will have ${timeout} seconds to undo.`;
  const finalDescription = description || defaultDescription;

  // Countdown timer for undo option
  useEffect(() => {
    if (isDeleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && isDeleted) {
      // Undo window closed, item is permanently deleted
      setTimeout(() => {
        onCancel();
        setTimeLeft(timeout);
      }, 500);
    }
  }, [isDeleted, timeLeft, onCancel, timeout]);

  // Reset timeLeft when dialog opens or timeout changes
  useEffect(() => {
    if (open && !isDeleted) {
      setTimeLeft(timeout);
    }
  }, [open, timeout, isDeleted]);

  const handleUndo = () => {
    setShowSnackbar(true);
    if (onUndo) {
      onUndo();
    }
  };

  const handleCancel = () => {
    setTimeLeft(timeout);
    onCancel();
  };

  if (isDeleted) {
    return (
      <>
        <Dialog
          open={open && isDeleted}
          onClose={handleCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#e3f2fd', pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Delete sx={{ color: '#1976d2' }} />
              <Typography variant="h6">Item Deleted Successfully</Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Box>
              <Typography variant="body1" gutterBottom>
                ✓ <strong>{itemName}</strong> has been deleted
              </Typography>

              <Box my={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Undo available in: <strong>{timeLeft}s</strong>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={((timeout - timeLeft) / timeout) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: '#ff9800',
                    },
                  }}
                />
              </Box>

              <Alert severity="info">
                The item will be permanently deleted when the undo window closes.
              </Alert>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={handleCancel}
              variant="outlined"
              color="inherit"
              fullWidth
            >
              Close
            </Button>
            <Button
              onClick={handleUndo}
              variant="contained"
              color="primary"
              startIcon={<Undo />}
              fullWidth
              disabled={timeLeft === 0}
            >
              {timeLeft === 0 ? 'Cannot Undo' : `Undo (${timeLeft}s)`}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          message="Item restored successfully!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#ffebee',
          borderBottom: '2px solid #ef5350',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Delete sx={{ color: '#d32f2f' }} />
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="caption" color="textSecondary">
            {itemName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2.5 }}>
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>⚠️ Warning:</strong> This action cannot be reversed immediately, but
            you will have {timeout} seconds to undo it.
          </Alert>

          <Typography variant="body1" paragraph>
            {finalDescription}
          </Typography>

          <Box sx={{ backgroundColor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Item to delete:</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
              {itemName}
            </Typography>
          </Box>

          <Typography variant="caption" color="textSecondary" display="block">
            After confirming, you will have {timeout} seconds to undo this action. After that,
            the item will be permanently deleted.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="inherit"
          fullWidth
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<Delete />}
          fullWidth
          loading={loading}
          sx={{
            '&:hover': {
              backgroundColor: '#c62828',
            },
          }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
