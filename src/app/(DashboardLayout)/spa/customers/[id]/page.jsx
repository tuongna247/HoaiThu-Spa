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
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { authenticatedFetch } = useAuth();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Purchase Dialog
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [servicePackages, setServicePackages] = useState([]);
  const [purchaseForm, setPurchaseForm] = useState({
    servicePromotionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/spa/customers', title: 'Customers' },
    { title: 'Customer Details' },
  ];

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
      fetchServicePackages();
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/spa/customers/${customerId}`);
      const data = await response.json();

      if (data.status === 200) {
        setCustomer(data.data.customer);
        setPurchases(data.data.purchases || []);
        setUsageHistory(data.data.usageHistory || []);
      } else {
        setError(data.msg || 'Failed to load customer details');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicePackages = async () => {
    try {
      const response = await authenticatedFetch('/api/spa/service-promotions?limit=100');
      const data = await response.json();
      if (data.status === 200) {
        setServicePackages(data.data.servicePromotions.filter(sp => sp.isActive));
      }
    } catch (err) {
      console.error('Error fetching service packages:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePurchaseDialogOpen = () => {
    setPurchaseForm({
      servicePromotionId: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: ''
    });
    setOpenPurchaseDialog(true);
  };

  const handlePurchaseDialogClose = () => {
    setOpenPurchaseDialog(false);
    setError(null);
  };

  const handlePurchaseInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePurchaseSubmit = async () => {
    try {
      setError(null);

      if (!purchaseForm.servicePromotionId || !purchaseForm.paymentDate) {
        setError('Service package and payment date are required');
        return;
      }

      const response = await authenticatedFetch('/api/spa/purchases', {
        method: 'POST',
        body: JSON.stringify({
          ...purchaseForm,
          customerId
        })
      });

      const data = await response.json();

      if (data.status === 201) {
        setSuccess('Purchase added successfully');
        handlePurchaseDialogClose();
        fetchCustomerDetails();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to add purchase');
      }
    } catch (err) {
      console.error('Error adding purchase:', err);
      setError('Failed to add purchase');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <PageContainer title="Customer Details" description="View customer details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!customer) {
    return (
      <PageContainer title="Customer Details" description="View customer details">
        <Alert severity="error">Customer not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Customer Details" description="View customer details">
      <Breadcrumb title="Customer Details" items={BCrumb} />

      <Box mt={3}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Customer Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => router.back()}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5">
                  {customer.firstName} {customer.middleName} {customer.lastName}
                </Typography>
                <Chip
                  label={customer.isActive ? 'Active' : 'Inactive'}
                  color={customer.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/spa/customers?edit=${customerId}`)}
              >
                Edit Customer
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">Phone Number</Typography>
                <Typography variant="body1" fontWeight={600}>{customer.phoneNumber}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1" fontWeight={600}>{customer.email || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {customer.dateOfBirth ? format(new Date(customer.dateOfBirth), 'dd/MM/yyyy') : '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">Total Remaining Services</Typography>
                <Typography variant="h6" color="primary">{customer.totalRemainingServices || 0}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="textSecondary">Address</Typography>
                <Typography variant="body1">{customer.address || '-'}</Typography>
              </Grid>
              {customer.notes && (
                <Grid size={12}>
                  <Typography variant="body2" color="textSecondary">Notes</Typography>
                  <Typography variant="body1">{customer.notes}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs for Purchases and Usage History */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`Purchases (${purchases.length})`} />
              <Tab label={`Usage History (${usageHistory.length})`} />
            </Tabs>
          </Box>

          {/* Purchases Tab */}
          {tabValue === 0 && (
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Service Packages</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handlePurchaseDialogOpen}
                >
                  Add Purchase
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Promotion</TableCell>
                      <TableCell align="center">Total Times</TableCell>
                      <TableCell align="center">Remaining</TableCell>
                      <TableCell align="right">Amount Paid</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchases.length > 0 ? (
                      purchases.map((purchase) => (
                        <TableRow key={purchase._id}>
                          <TableCell>{purchase.servicePromotionId?.serviceId?.serviceName || 'N/A'}</TableCell>
                          <TableCell>{purchase.servicePromotionId?.promotionId?.promotionName || 'N/A'}</TableCell>
                          <TableCell align="center">{purchase.timesTotal}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={purchase.timesRemaining}
                              color={purchase.timesRemaining > 0 ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(purchase.amountPaid)}</TableCell>
                          <TableCell>{format(new Date(purchase.paymentDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={purchase.status}
                              color={purchase.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary" py={3}>
                            No purchases found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}

          {/* Usage History Tab */}
          {tabValue === 1 && (
            <CardContent>
              <Typography variant="h6" mb={2}>Usage History</Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Promotion</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usageHistory.length > 0 ? (
                      usageHistory.map((usage) => (
                        <TableRow key={usage._id}>
                          <TableCell>
                            {usage.usingDateTime ? format(new Date(usage.usingDateTime), 'dd/MM/yyyy HH:mm') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {usage.customerPurchaseId?.servicePromotionId?.serviceId?.serviceName || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {usage.customerPurchaseId?.servicePromotionId?.promotionId?.promotionName || 'N/A'}
                          </TableCell>
                          <TableCell>{usage.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="textSecondary" py={3}>
                            No usage history found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          )}
        </Card>
      </Box>

      {/* Add Purchase Dialog */}
      <Dialog open={openPurchaseDialog} onClose={handlePurchaseDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Purchase</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Service Package *</InputLabel>
                <Select
                  name="servicePromotionId"
                  value={purchaseForm.servicePromotionId}
                  label="Service Package *"
                  onChange={handlePurchaseInputChange}
                >
                  <MenuItem value="">Select a package</MenuItem>
                  {servicePackages.map((pkg) => (
                    <MenuItem key={pkg._id} value={pkg._id}>
                      {pkg.serviceId?.serviceName} - {pkg.promotionId?.promotionName}
                      ({pkg.promotionId?.times}x, {formatCurrency(pkg.finalPrice)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Payment Date *"
                name="paymentDate"
                type="date"
                value={purchaseForm.paymentDate}
                onChange={handlePurchaseInputChange}
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
                value={purchaseForm.notes}
                onChange={handlePurchaseInputChange}
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePurchaseDialogClose}>Cancel</Button>
          <Button onClick={handlePurchaseSubmit} variant="contained">
            Add Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default CustomerDetailPage;
