'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Service Usage' },
];

const ServiceUsagePage = () => {
  const { authenticatedFetch } = useAuth();

  const [usages, setUsages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUsage, setEditingUsage] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerPurchaseId: '',
    usingDateTime: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  useEffect(() => {
    fetchUsages();
    fetchCustomers();
  }, [page, rowsPerPage]);

  const fetchUsages = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/spa/usage?page=${page + 1}&limit=${rowsPerPage}`
      );
      const data = await response.json();

      if (data.status === 200) {
        setUsages(data.data.usageRecords);
        setTotal(data.data.pagination.total);

      } else {
        setError(data.msg || 'Failed to load service usages');
      }
    } catch (err) {
      console.error('Error fetching usages:', err);
      setError('Failed to load service usages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await authenticatedFetch('/api/spa/customers?limit=1000');
      const data = await response.json();
      if (data.status === 200) {
        setCustomers(data.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchCustomerPurchases = async (customerId) => {
    try {
      const response = await authenticatedFetch(`/api/spa/purchases?customerId=${customerId}&status=active`);
      const data = await response.json();
      if (data.status === 200) {
        setPurchases(data.data.purchases.filter(p => p.timesRemaining > 0));
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setPurchases([]);
    }
  };

  const handleOpenDialog = (usage = null) => {
    if (usage) {
      setEditingUsage(usage);
      setSelectedCustomer(usage.customerId);
      setFormData({
        customerId: usage.customerId?._id || '',
        customerPurchaseId: usage.customerPurchaseId?._id || '',
        usingDateTime: usage.usingDateTime ? new Date(usage.usingDateTime).toISOString().slice(0, 16) : '',
        notes: usage.notes || ''
      });
      if (usage.customerId?._id) {
        fetchCustomerPurchases(usage.customerId._id);
      }
    } else {
      setEditingUsage(null);
      setSelectedCustomer(null);
      setFormData({
        customerId: '',
        customerPurchaseId: '',
        usingDateTime: new Date().toISOString().slice(0, 16),
        notes: ''
      });
      setPurchases([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUsage(null);
    setSelectedCustomer(null);
    setPurchases([]);
    setError(null);
  };

  const handleCustomerChange = (event, newValue) => {
    setSelectedCustomer(newValue);
    if (newValue) {
      setFormData(prev => ({ ...prev, customerId: newValue._id, customerPurchaseId: '' }));
      fetchCustomerPurchases(newValue._id);
    } else {
      setFormData(prev => ({ ...prev, customerId: '', customerPurchaseId: '' }));
      setPurchases([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validation
      if (!formData.customerId || !formData.customerPurchaseId || !formData.usingDateTime) {
        setError('Customer, purchase, and date/time are required');
        return;
      }

      const url = editingUsage
        ? `/api/spa/usage/${editingUsage._id}`
        : '/api/spa/usage';

      const method = editingUsage ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        setSuccess(editingUsage ? 'Usage updated successfully' : 'Usage recorded successfully');
        handleCloseDialog();
        fetchUsages();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to save usage');
      }
    } catch (err) {
      console.error('Error saving usage:', err);
      setError('Failed to save usage');
    }
  };

  const handleDelete = async (usageId) => {
    if (!window.confirm('Are you sure you want to delete this usage record?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/spa/usage/${usageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 200) {
        setSuccess('Usage deleted successfully');
        fetchUsages();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to delete usage');
      }
    } catch (err) {
      console.error('Error deleting usage:', err);
      setError('Failed to delete usage');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PageContainer title="Service Usage" description="Record customer service usage">
      <Breadcrumb title="Service Usage" items={BCrumb} />

      <Box mt={3}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Service Usage History</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Record Usage
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Promotion</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usages.length > 0 ? (
                        usages.map((usage) => (
                          <TableRow key={usage._id} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {usage.usingDateTime ? format(new Date(usage.usingDateTime), 'dd/MM/yyyy HH:mm') : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {usage.customerId?.firstName} {usage.customerId?.lastName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {usage.customerId?.phoneNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {usage.customerPurchaseId?.servicePromotionId?.serviceId?.serviceName || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {usage.customerPurchaseId?.servicePromotionId?.promotionId?.promotionName || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {usage.notes || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenDialog(usage)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(usage._id)}
                                title="Delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="textSecondary" py={3}>
                              No usage records found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUsage ? 'Edit Usage' : 'Record Service Usage'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${option.phoneNumber}`}
                value={selectedCustomer}
                onChange={handleCustomerChange}
                renderInput={(params) => <TextField {...params} label="Customer *" />}
                disabled={!!editingUsage}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth disabled={!selectedCustomer || purchases.length === 0}>
                <InputLabel>Service Package *</InputLabel>
                <Select
                  name="customerPurchaseId"
                  value={formData.customerPurchaseId}
                  label="Service Package *"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select a package</MenuItem>
                  {purchases.map((purchase) => (
                    <MenuItem key={purchase._id} value={purchase._id}>
                      {purchase.servicePromotionId?.serviceId?.serviceName} -
                      {purchase.servicePromotionId?.promotionId?.promotionName}
                      ({purchase.timesRemaining} remaining)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedCustomer && purchases.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  No active packages with remaining services for this customer
                </Typography>
              )}
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Date & Time *"
                name="usingDateTime"
                type="datetime-local"
                value={formData.usingDateTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUsage ? 'Update' : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ServiceUsagePage;
