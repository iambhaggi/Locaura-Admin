import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

// Approve Review Dialog
export const ApproveReviewDialog = ({ open, review, onClose, onApprove }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: '#4caf50', color: 'white', fontWeight: 'bold' }}>
        ✓ Approve Review
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Are you sure you want to approve this review?
        </Typography>
        <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {review?.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            By {review?.consumer_name}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#999' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ background: '#4caf50' }}
          onClick={() => {
            onApprove(review?._id);
            onClose();
          }}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Hide Review Dialog
export const HideReviewDialog = ({ open, review, onClose, onHide }) => {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: '#ff9800', color: 'white', fontWeight: 'bold' }}>
        🙈 Hide Review
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Why are you hiding this review?
        </Typography>
        <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {review?.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            By {review?.consumer_name}
          </Typography>
        </Box>
        <TextField
          fullWidth
          label="Reason for hiding"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Inappropriate content, Spam, Misleading information"
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#999' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ background: '#ff9800' }}
          onClick={() => {
            onHide(review?._id, reason);
            setReason('');
            onClose();
          }}
          disabled={!reason.trim()}
        >
          Hide Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reply to Review Dialog
export const ReplyReviewDialog = ({ open, review, onClose, onReply }) => {
  const [replyText, setReplyText] = useState(review?.reply?.text || '');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: '#2196f3', color: 'white', fontWeight: 'bold' }}>
        💬 Reply to Review
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Write a response to this reviewer
        </Typography>
        <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {review?.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            By {review?.consumer_name}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {review?.body}
          </Typography>
        </Box>
        <TextField
          fullWidth
          label="Your reply"
          multiline
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Thank you for your feedback..."
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#999' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ background: '#2196f3' }}
          onClick={() => {
            onReply(review?._id, replyText);
            setReplyText('');
            onClose();
          }}
          disabled={!replyText.trim()}
        >
          Post Reply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Review Dialog
export const DeleteReviewDialog = ({ open, review, onClose, onDelete }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: '#f44336', color: 'white', fontWeight: 'bold' }}>
        🗑️ Delete Review
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Are you sure you want to permanently delete this review? This action cannot be undone.
        </Typography>
        <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {review?.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            By {review?.consumer_name}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#999' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ background: '#f44336' }}
          onClick={() => {
            onDelete(review?._id);
            onClose();
          }}
        >
          Delete Permanently
        </Button>
      </DialogActions>
    </Dialog>
  );
};
