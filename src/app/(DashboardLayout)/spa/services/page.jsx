'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment
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
  { title: 'Services' },
];

const ServicesPage = () => {
  const { authenticatedFetch } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    duration: ''
  });

  useEffect(() => {
    fetchServices();
  }, [page, rowsPerPage, searchTerm]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/spa/services?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.status === 200) {
        setServices(data.data.services);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.msg || 'Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        basePrice: service.basePrice || '',
        duration: service.duration || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        duration: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
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
      if (!formData.name || !formData.description || !formData.basePrice || !formData.duration) {
        setError('Name, description, base price, and duration are required');
        return;
      }

      const url = editingService
        ? `/api/spa/services/${editingService._id}`
        : '/api/spa/services';

      const method = editingService ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        setSuccess(editingService ? 'Service updated successfully' : 'Service created successfully');
        handleCloseDialog();
        fetchServices();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to save service');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/spa/services/${serviceId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 200) {
        setSuccess('Service deleted successfully');
        fetchServices();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <PageContainer title="Services" description="Manage spa services">
      <Breadcrumb title="Services" items={BCrumb} />

      <Box mt={3}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Service List</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Service
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Search by service name..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

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
                        <TableCell>Service Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {services.length > 0 ? (
                        services.map((service) => (
                          <TableRow key={service._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {service.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {service.description || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" fontWeight={600}>
                                {formatCurrency(service.basePrice)}
                              </Typography>
                            </TableCell>
                            <TableCell>{service.duration ? `${service.duration} mins` : '-'}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={service.isActive ? 'Active' : 'Inactive'}
                                color={service.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenDialog(service)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(service._id)}
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
                              No services found
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
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Service Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Base Price (VND) *"
                name="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Duration (minutes) *"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g. 60"
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingService ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ServicesPage;
