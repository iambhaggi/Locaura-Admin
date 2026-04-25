import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as EyeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

function DataTable({
  title,
  columns,
  data,
  loading,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  searchPlaceholder = 'Search...',
  actions = true,
}) {
  const [search, setSearch] = React.useState('');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState('view'); // view, edit, delete

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch?.(search);
  };

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setDialogType('edit');
    setOpenDialog(true);
  };

  const handleViewClick = (row) => {
    setSelectedRow(row);
    setDialogType('view');
    setOpenDialog(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDialogType('delete');
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(selectedRow.id);
    setOpenDialog(false);
  };

  const renderCellValue = (value, dataType) => {
    if (!value) return '-';
    
    if (dataType === 'status') {
      const statusColors = {
        active: 'success',
        inactive: 'error',
        pending: 'warning',
        approved: 'success',
        rejected: 'error',
        delivered: 'success',
        cancelled: 'error',
        paid: 'success',
      };
      return <Chip label={value} color={statusColors[value] || 'default'} size="small" />;
    }
    
    if (dataType === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (dataType === 'currency') {
      return `₹${parseFloat(value).toFixed(2)}`;
    }
    
    if (dataType === 'email') {
      return <span style={{ wordBreak: 'break-all' }}>{value}</span>;
    }
    
    return value;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
            }}
          />
          <Button variant="contained" onClick={handleSearchSubmit} size="small">
            Search
          </Button>
          {onRefresh && (
            <Button variant="outlined" onClick={onRefresh} size="small">
              Refresh
            </Button>
          )}
        </div>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                  width={col.width}
                  align={col.align || 'left'}
                >
                  {col.label}
                </TableCell>
              ))}
              {actions && (
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', borderBottom: '2px solid #e0e0e0' }} align="center">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                    },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {renderCellValue(row[col.id], col.type)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewClick(row)}
                        title="View"
                      >
                        <EyeIcon fontSize="small" />
                      </IconButton>
                      {onEdit && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(row)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total || 0}
        rowsPerPage={rowsPerPage || 10}
        page={page || 0}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      {/* View/Edit Dialog */}
      {selectedRow && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogType === 'view' ? 'View Details' : 'Edit Details'}
          </DialogTitle>
          <DialogContent dividers>
            {dialogType === 'delete' ? (
              <p>Are you sure you want to delete this record?</p>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {Object.entries(selectedRow).map(([key, value]) => (
                  key !== 'id' && (
                    <Box key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value || '-')}
                    </Box>
                  )
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            {dialogType === 'delete' && (
              <Button onClick={handleConfirmDelete} color="error" variant="contained">
                Delete
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default DataTable;
