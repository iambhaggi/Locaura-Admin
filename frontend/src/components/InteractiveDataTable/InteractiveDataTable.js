import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const InteractiveDataTable = ({ title, columns, data, onUpdate, editableFields = [] }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [dialog, setDialog] = useState({ open: false, data: null });

  const handleExpandClick = (rowId) => {
    setExpandedId(expandedId === rowId ? null : rowId);
    if (editingId) setEditingId(null);
  };

  const handleEditClick = (row) => {
    setEditingId(row._id);
    setEditData({ ...row });
  };

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setEditingId(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleViewFullDetails = (row) => {
    setDialog({ open: true, data: row });
  };

  const handleEditFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: 'success',
      completed: 'success',
      verified: 'success',
      pending: 'warning',
      processing: 'info',
      failed: 'error',
      cancelled: 'error',
      rejected: 'error',
      inactive: 'default',
    };
    return colorMap[status?.toLowerCase()] || 'default';
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {title}
          </Typography>
          <TableContainer component={Paper}>
            <Table hover>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '50px' }}>Expand</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.field} sx={{ fontWeight: 'bold' }}>
                      {col.label}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <React.Fragment key={row._id}>
                    <TableRow
                      hover
                      onClick={() => handleExpandClick(row._id)}
                      sx={{ cursor: 'pointer', background: expandedId === row._id ? '#f0f7ff' : 'inherit' }}
                    >
                      <TableCell>
                        <IconButton size="small" onClick={() => handleExpandClick(row._id)}>
                          <ExpandMoreIcon
                            sx={{
                              transform: expandedId === row._id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                            }}
                          />
                        </IconButton>
                      </TableCell>

                      {editingId === row._id
                        ? columns.map((col) => (
                            <TableCell key={col.field}>
                              {editableFields.includes(col.field) ? (
                                <TextField
                                  size="small"
                                  value={editData[col.field] || ''}
                                  onChange={(e) => handleEditFieldChange(col.field, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <Typography variant="body2">{row[col.field]}</Typography>
                              )}
                            </TableCell>
                          ))
                        : columns.map((col) => (
                            <TableCell key={col.field}>
                              {col.field === 'status' ? (
                                <Chip
                                  label={row[col.field]}
                                  size="small"
                                  color={getStatusColor(row[col.field])}
                                  variant="outlined"
                                />
                              ) : typeof row[col.field] === 'object' ? (
                                <Typography variant="body2">{JSON.stringify(row[col.field])}</Typography>
                              ) : (
                                <Typography variant="body2">{row[col.field]}</Typography>
                              )}
                            </TableCell>
                          ))}

                      <TableCell>
                        {editingId === row._id ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={handleSaveEdit} color="success">
                              <SaveIcon />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancelEdit} color="error">
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(row);
                              }}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <Button
                              size="small"
                              variant="text"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewFullDetails(row);
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expandable Details Row */}
                    <TableRow>
                      <TableCell colSpan={columns.length + 2} sx={{ p: 0 }}>
                        <Collapse in={expandedId === row._id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, background: '#f9f9f9' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                              Detailed Information
                            </Typography>
                            <Grid container spacing={2}>
                              {Object.entries(row).map(([key, value]) => (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                                      {key.toUpperCase()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Full Details Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>{title} - Full Details</DialogTitle>
        <DialogContent dividers>
          {dialog.data && (
            <Grid container spacing={2}>
              {Object.entries(dialog.data).map(([key, value]) => (
                <Grid item xs={12} key={key}>
                  <Box sx={{ p: 1.5, background: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
                      {key}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.75, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                    >
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InteractiveDataTable;
