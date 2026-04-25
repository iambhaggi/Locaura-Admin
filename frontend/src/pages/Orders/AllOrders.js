import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog/DeleteConfirmDialog';
import { ordersAPI } from '../../services/apiService';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [addDialog, setAddDialog] = useState({ open: false, data: null });
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletedOrder, setDeletedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAll({ limit: 1000 });
        const mapped = (response?.data?.data || response?.data || []).map((order) => ({
          ...order,
          total_price: Number(order.pricing?.total || 0),
          consumer_email: order.consumer_email || String(order.consumer_id || '-'),
          store_name: order.store_name || String(order.store_id || '-'),
          created_at: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
          delivery_address: [
            order.delivery_address?.line1,
            order.delivery_address?.line2,
            order.delivery_address?.city,
            order.delivery_address?.state,
            order.delivery_address?.pincode,
          ].filter(Boolean).join(', '),
          payment_method: order.payment?.method || '-',
          items_count: Array.isArray(order.items) ? order.items.length : 0,
        }));
        setOrders(mapped);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleAddOrder = () => {
    setAddDialog({ 
      open: true, 
      data: {
        order_number: '',
        consumer_id: '',
        retailer_id: '',
        store_id: '',
        delivery_partner_id: '',
        items_json: '',
        pricing_json: '',
        delivery_address_json: '',
        payment_json: '',
        status: 'pending',
        special_instructions: '',
        estimated_delivery_at: '',
        delivered_at: '',
      }
    });
  };

  const handleEditOrder = (order) => {
    setEditDialog({ open: true, data: { ...order } });
  };

  const handleViewDetails = (order) => {
    setDetailsDialog({ open: true, data: order });
  };

  const handleSaveNew = async () => {
    const payload = addDialog.data || {};
    if (!payload.store_id || !payload.retailer_id || !payload.consumer_id) {
      alert('Please provide store_id, retailer_id and consumer_id');
      return;
    }

    let items = [];
    let pricing = {};
    let delivery_address = {};
    let payment = {};

    try {
      if (payload.items_json) {
        items = JSON.parse(payload.items_json);
      }
      if (payload.pricing_json) {
        pricing = JSON.parse(payload.pricing_json);
      }
      if (payload.delivery_address_json) {
        delivery_address = JSON.parse(payload.delivery_address_json);
      }
      if (payload.payment_json) {
        payment = JSON.parse(payload.payment_json);
      }
    } catch (e) {
      alert('Invalid JSON in one of the fields');
      return;
    }

    try {
      setLoading(true);
      await ordersAPI.create({
        order_number: payload.order_number,
        store_id: payload.store_id,
        retailer_id: payload.retailer_id,
        consumer_id: payload.consumer_id,
        delivery_partner_id: payload.delivery_partner_id || null,
        items,
        pricing,
        delivery_address,
        payment,
        status: payload.status || 'pending',
        special_instructions: payload.special_instructions,
        estimated_delivery_at: payload.estimated_delivery_at ? new Date(payload.estimated_delivery_at) : null,
        delivered_at: payload.delivered_at ? new Date(payload.delivered_at) : null,
      });

      const refreshed = await ordersAPI.getAll({ limit: 1000 });
      const mapped = (refreshed?.data?.data || refreshed?.data || []).map((order) => ({
        ...order,
        total_price: Number(order.pricing?.total || 0),
        consumer_email: order.consumer_email || String(order.consumer_id || '-'),
        store_name: order.store_name || String(order.store_id || '-'),
        created_at: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
        delivery_address: [
          order.delivery_address?.line1,
          order.delivery_address?.line2,
          order.delivery_address?.city,
          order.delivery_address?.state,
          order.delivery_address?.pincode,
        ].filter(Boolean).join(', '),
        payment_method: order.payment?.method || '-',
        items_count: Array.isArray(order.items) ? order.items.length : 0,
      }));
      setOrders(mapped);
      setAddDialog({ open: false, data: null });
      alert('Order added successfully');
    } catch (saveError) {
      alert(saveError.message || 'Failed to add order');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editDialog.data) {
      setOrders(orders.map(o => o._id === editDialog.data._id ? editDialog.data : o));
      setEditDialog({ open: false, data: null });
    }
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setDeleteDialog(true);
    setIsDeleted(false);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      setDeletedOrder(orderToDelete);
      setIsDeleted(true);
      setOrders(orders.filter(o => o._id !== orderToDelete._id));
    }
  };

  const handleUndoDelete = () => {
    if (deletedOrder) {
      setOrders([...orders, deletedOrder]);
      setDeleteDialog(false);
      setDeletedOrder(null);
      setOrderToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    if (!isDeleted) {
      setOrderToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'out_for_delivery': return 'info';
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'placed': return 'warning';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, color: '#3f51b5' },
    { label: 'Delivered', value: orders.filter((o) => ['delivered', 'completed'].includes((o.status || '').toLowerCase())).length, color: '#4caf50' },
    { label: 'In Transit', value: orders.filter((o) => ['in_transit', 'out_for_delivery'].includes((o.status || '').toLowerCase())).length, color: '#2196f3' },
    { label: 'Cancelled', value: orders.filter((o) => (o.status || '').toLowerCase() === 'cancelled').length, color: '#f44336' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      {loading && <Typography sx={{ mb: 2 }}>Loading orders...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Orders Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOrder}>Add Order</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" sx={{ color: stat.color, mt: 1 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ background: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.consumer_email}</TableCell>
                    <TableCell>{order.store_name}</TableCell>
                    <TableCell>₹{order.total_price}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" color={getStatusColor(order.status)} variant="outlined" />
                    </TableCell>
                    <TableCell>{order.created_at}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="info" onClick={() => handleViewDetails(order)} title="View Details">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditOrder(order)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteOrder(order)} title="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No orders found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Order Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsDialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Order Number</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{detailsDialog.data.order_number}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                <Typography sx={{ fontWeight: 'bold', color: getStatusColor(detailsDialog.data.status) }}>{detailsDialog.data.status.toUpperCase()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Consumer Email</Typography>
                <Typography>{detailsDialog.data.consumer_email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Store Name</Typography>
                <Typography>{detailsDialog.data.store_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Total Amount</Typography>
                <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2196f3' }}>₹{detailsDialog.data.total_price}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Items</Typography>
                <Typography>{detailsDialog.data.items_count} items</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Payment Method</Typography>
                <Typography>{detailsDialog.data.payment_method}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Delivery Address</Typography>
                <Typography>{detailsDialog.data.delivery_address}</Typography>
              </Box>
              {detailsDialog.data.status === 'cancelled' && (
                <>
                  <Box sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#c62828' }}>❌ Cancellation Reason</Typography>
                    <Typography sx={{ color: '#c62828', fontWeight: 'bold' }}>{detailsDialog.data.cancellation_reason || 'No reason provided'}</Typography>
                  </Box>
                </>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Date Created</Typography>
                <Typography>{detailsDialog.data.created_at}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add New Order Dialog */}
      <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>Add New Order - All Fields</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '70vh', overflow: 'auto' }}>
          {addDialog.data && (
            <>
              <TextField label="Order Number" value={addDialog.data.order_number} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, order_number: e.target.value } })} fullWidth required />
              <TextField label="Store ID" value={addDialog.data.store_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, store_id: e.target.value } })} fullWidth required />
              <TextField label="Retailer ID" value={addDialog.data.retailer_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, retailer_id: e.target.value } })} fullWidth required />
              <TextField label="Consumer ID" value={addDialog.data.consumer_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, consumer_id: e.target.value } })} fullWidth required />
              <TextField label="Delivery Partner ID" value={addDialog.data.delivery_partner_id} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, delivery_partner_id: e.target.value } })} fullWidth />

              <TextField
                label="Items (JSON Array)"
                value={addDialog.data.items_json}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, items_json: e.target.value } })}
                fullWidth
                multiline
                rows={4}
                helperText='Example: [{"product_id": "...", "variant_id": "...", "product_name": "Item", "variant_sku": "SKU", "variant_label": "Label", "quantity": 1, "unit_price": 100, "total_price": 100}]'
              />

              <TextField
                label="Pricing (JSON Object)"
                value={addDialog.data.pricing_json}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, pricing_json: e.target.value } })}
                fullWidth
                multiline
                rows={3}
                helperText='Example: {"subtotal": 100, "delivery_fee": 20, "discount": 10, "tax": 5, "total": 115}'
              />

              <TextField
                label="Delivery Address (JSON Object)"
                value={addDialog.data.delivery_address_json}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, delivery_address_json: e.target.value } })}
                fullWidth
                multiline
                rows={4}
                helperText='Example: {"line1": "Address", "line2": "Line 2", "city": "City", "state": "State", "pincode": "123456", "location": {"type": "Point", "coordinates": [lng, lat]}}'
              />

              <TextField
                label="Payment (JSON Object)"
                value={addDialog.data.payment_json}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, payment_json: e.target.value } })}
                fullWidth
                multiline
                rows={3}
                helperText='Example: {"method": "UPI", "status": "pending", "reference": "REF123"}'
              />

              <TextField select label="Status" value={addDialog.data.status} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </TextField>

              <TextField label="Special Instructions" value={addDialog.data.special_instructions} onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, special_instructions: e.target.value } })} fullWidth multiline rows={2} />

              <TextField
                label="Estimated Delivery At"
                type="datetime-local"
                value={addDialog.data.estimated_delivery_at}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, estimated_delivery_at: e.target.value } })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Delivered At"
                type="datetime-local"
                value={addDialog.data.delivered_at}
                onChange={(e) => setAddDialog({ ...addDialog, data: { ...addDialog.data, delivered_at: e.target.value } })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained">Add Order</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editDialog.data && (
            <>
              <TextField label="Order Number" value={editDialog.data.order_number} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, order_number: e.target.value } })} fullWidth />
              <TextField label="Consumer Email" value={editDialog.data.consumer_email} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, consumer_email: e.target.value } })} fullWidth />
              <TextField label="Store Name" value={editDialog.data.store_name} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, store_name: e.target.value } })} fullWidth />
              <TextField label="Total Price (₹)" type="number" value={editDialog.data.total_price} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, total_price: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Items Count" type="number" value={editDialog.data.items} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, items: parseInt(e.target.value) } })} fullWidth />
              <TextField select label="Status" value={editDialog.data.status} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, status: e.target.value } })} fullWidth>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
              {editDialog.data.status === 'cancelled' && (
                <TextField select label="Cancellation Reason" value={editDialog.data.cancellation_reason} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, cancellation_reason: e.target.value } })} fullWidth>
                  <option value="">Select reason</option>
                  <option value="customer_requested">Customer Requested</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="store_unavailable">Store Unavailable</option>
                  <option value="delivery_impossible">Delivery Impossible</option>
                  <option value="payment_failed">Payment Failed</option>
                </TextField>
              )}
              <TextField label="Delivery Address" value={editDialog.data.delivery_address} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, delivery_address: e.target.value } })} fullWidth multiline rows={2} />
              <TextField select label="Payment Method" value={editDialog.data.payment_method} onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, payment_method: e.target.value } })} fullWidth>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="WALLET">Wallet</option>
                <option value="CASH">Cash on Delivery</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Order"
        description="This order will be deleted. You have 10 seconds to undo this action."
        itemName={orderToDelete?.order_id || 'Order'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        isDeleted={isDeleted}
        onUndo={handleUndoDelete}
      />
    </Container>
  );
};

export default AllOrders;
