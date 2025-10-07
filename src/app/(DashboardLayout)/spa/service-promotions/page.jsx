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
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Service Packages' },
];

const ServicePackagesPage = () => {
  const { authenticatedFetch } = useAuth();

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    promotionId: ''
  });

  useEffect(() => {
    fetchPackages();
    fetchServices();
    fetchPromotions();
  }, [page, rowsPerPage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/spa/service-promotions?page=${page + 1}&limit=${rowsPerPage}`
      );
      const data = await response.json();

      if (data.status === 200) {
        setPackages(data.data.servicePromotions);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.msg || 'Failed to load service packages');
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to load service packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await authenticatedFetch('/api/spa/services?limit=100');
      const data = await response.json();
      if (data.status === 200) {
        setServices(data.data.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await authenticatedFetch('/api/spa/promotions?limit=100');
      const data = await response.json();
      if (data.status === 200) {
        setPromotions(data.data.promotions);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    }
  };

  const handleOpenDialog = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        serviceId: pkg.serviceId?._id || '',
        promotionId: pkg.promotionId?._id || ''
      });
    } else {
      setEditingPackage(null);
      setFormData({
        serviceId: '',
        promotionId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPackage(null);
    setError(null);
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
      if (!formData.serviceId || !formData.promotionId) {
        setError('Service and promotion are required');
        return;
      }

      const url = editingPackage
        ? `/api/spa/service-promotions/${editingPackage._id}`
        : '/api/spa/service-promotions';

      const method = editingPackage ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        setSuccess(editingPackage ? 'Package updated successfully' : 'Package created successfully');
        handleCloseDialog();
        fetchPackages();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to save package');
      }
    } catch (err) {
      console.error('Error saving package:', err);
      setError('Failed to save package');
    }
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/spa/service-promotions/${packageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 200) {
        setSuccess('Package deleted successfully');
        fetchPackages();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to delete package');
      }
    } catch (err) {
      console.error('Error deleting package:', err);
      setError('Failed to delete package');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <PageContainer title="Service Packages" description="Manage spa service packages">
      <Breadcrumb title="Service Packages" items={BCrumb} />

      <Box mt={3}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Service Package List</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Package
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
                        <TableCell>Service</TableCell>
                        <TableCell>Promotion</TableCell>
                        <TableCell align="center">Times</TableCell>
                        <TableCell align="center">Discount</TableCell>
                        <TableCell align="right">Original Price</TableCell>
                        <TableCell align="right">Final Price</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {packages.length > 0 ? (
                        packages.map((pkg) => (
                          <TableRow key={pkg._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {pkg.serviceName }
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {pkg.promotionName || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={`${pkg.timesIncluded|| 0}x`} size="small" />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={`${pkg.discountPercent}%`} color="success" size="small" />
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(pkg.price || 0)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" fontWeight={600} color="primary">
                                {formatCurrency(pkg.finalPrice || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={pkg.isActive ? 'Active' : 'Inactive'}
                                color={pkg.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenDialog(pkg)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(pkg._id)}
                                title="Delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="textSecondary" py={3}>
                              No packages found
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
          {editingPackage ? 'Edit Package' : 'Add New Package'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Service *</InputLabel>
                <Select
                  name="serviceId"
                  value={formData.serviceId}
                  label="Service *"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select a service</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service._id} value={service._id}>
                      {service.name} - {service.basePrice ? formatCurrency(service.basePrice) : 'N/A'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Promotion *</InputLabel>
                <Select
                  name="promotionId"
                  value={formData.promotionId}
                  label="Promotion *"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select a promotion</MenuItem>
                  {promotions.map((promotion) => (
                    <MenuItem key={promotion._id} value={promotion._id}>
                      {promotion.promotionName} ({promotion.times}x, {promotion.discountPercent}% off)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPackage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ServicePackagesPage;
