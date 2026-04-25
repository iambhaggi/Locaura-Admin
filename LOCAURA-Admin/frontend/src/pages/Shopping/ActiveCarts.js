import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Button, TextField, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import InteractiveDataTable from '../../components/InteractiveDataTable/InteractiveDataTable';
import { cartsAPI, consumersAPI } from '../../services/apiService';

const ActiveCarts = () => {
  const [carts, setCarts] = useState([]);
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await consumersAPI.getAll({ limit: 1000 });
        const consumers = response.data?.data || response.data || [];
        const mappedCarts = consumers
          .filter((consumer) => consumer?.cart?.store_id)
          .map((consumer) => ({
            _id: String(consumer._id),
            consumer_id: String(consumer._id),
            consumer_name: consumer.consumer_name || 'N/A',
            store_id: String(consumer.cart.store_id),
            store_name: consumer.cart.store_name || 'N/A',
            items_count: Array.isArray(consumer.cart.items) ? consumer.cart.items.length : 0,
            total_value: Number(consumer.cart.total || 0),
            status: 'active',
            last_updated: consumer.updatedAt ? new Date(consumer.updatedAt).toLocaleDateString() : '-',
          }));
        setCarts(mappedCarts);
      } catch (error) {
        console.error('Error fetching carts:', error);
      }
    };

    fetchCarts();
  }, []);


  const [dialog, setDialog] = useState({ open: false, data: null, isNew: false });

  const handleAddCart = () => {
    setDialog({ open: true, data: { consumer_id: '', consumer_name: '', store_id: '', store_name: '', items_json: '', subtotal: 0, platform_fee: 0, delivery_fee: 0, total: 0, status: 'active' }, isNew: true });
  };

  const handleSaveCart = async (cartData) => {
    if (!cartData?.consumer_id || !cartData?.store_id || !cartData?.store_name) {
      alert('Please fill consumer_id, store_id and store_name');
      return;
    }

    let items = [];
    try {
      if (cartData.items_json) {
        items = JSON.parse(cartData.items_json);
      }
    } catch (e) {
      alert('Invalid JSON for items');
      return;
    }

    if (dialog.isNew) {
      try {
        await cartsAPI.create({
          consumer_id: cartData.consumer_id,
          store_id: cartData.store_id,
          store_name: cartData.store_name,
          items,
          subtotal: Number(cartData.subtotal || 0),
          platform_fee: Number(cartData.platform_fee || 0),
          delivery_fee: Number(cartData.delivery_fee || 0),
          total: Number(cartData.total || 0),
        });
        setCarts([
          {
            ...cartData,
            _id: String(cartData.consumer_id),
            created_at: new Date().toISOString().split('T')[0],
          },
          ...carts,
        ]);
      } catch (error) {
        alert(error.message || 'Failed to add cart');
        return;
      }
    } else {
      setCarts(carts.map(c => c._id === cartData._id ? cartData : c));
    }
    setDialog({ open: false, data: null, isNew: false });
  };

  const handleDeleteCart = (id) => {
    setCarts(carts.filter(c => c._id !== id));
  };

  const columns = [
    { field: 'consumer_name', label: 'Consumer' },
    { field: 'store_name', label: 'Store' },
    { field: 'items_count', label: 'Items' },
    { field: 'total_value', label: 'Value (₹)' },
    { field: 'status', label: 'Status' },
    { field: 'last_updated', label: 'Last Updated' },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Active Shopping Carts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCart}>Add Cart</Button>
      </Box>

      <InteractiveDataTable
        title="All Active Carts"
        columns={columns}
        data={carts}
        onUpdate={handleSaveCart}
        editableFields={['consumer_name', 'items_count', 'total_value']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, data: null, isNew: false })} maxWidth="md" fullWidth>
        <DialogTitle>{dialog.isNew ? 'Add New Cart - All Fields' : 'Edit Cart'}</DialogTitle>
        <DialogContent sx={{ pt: 2, maxHeight: '70vh', overflow: 'auto' }}>
          {dialog.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Consumer ID" value={dialog.data.consumer_id} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, consumer_id: e.target.value } })} fullWidth required />
              <TextField label="Consumer Name" value={dialog.data.consumer_name} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, consumer_name: e.target.value } })} fullWidth />
              <TextField label="Store ID" value={dialog.data.store_id} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, store_id: e.target.value } })} fullWidth required />
              <TextField label="Store Name" value={dialog.data.store_name} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, store_name: e.target.value } })} fullWidth required />

              <TextField
                label="Items (JSON Array)"
                value={dialog.data.items_json}
                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, items_json: e.target.value } })}
                fullWidth
                multiline
                rows={4}
                helperText='Example: [{"product_id": "...", "variant_id": "...", "quantity": 1, "product_name": "Item", "price": 100}]'
              />

              <TextField label="Subtotal" type="number" value={dialog.data.subtotal} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, subtotal: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Platform Fee" type="number" value={dialog.data.platform_fee} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, platform_fee: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Delivery Fee" type="number" value={dialog.data.delivery_fee} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, delivery_fee: parseFloat(e.target.value) } })} fullWidth />
              <TextField label="Total" type="number" value={dialog.data.total} onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, total: parseFloat(e.target.value) } })} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, data: null, isNew: false })}>Cancel</Button>
          <Button onClick={() => handleSaveCart(dialog.data)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActiveCarts;
