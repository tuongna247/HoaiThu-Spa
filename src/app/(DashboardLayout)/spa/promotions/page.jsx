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
  Autocomplete
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
  { title: 'Promotions' },
];

const PromotionsPage = () => {
  const { authenticatedFetch } = useAuth();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Services
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    promotionName: '',
    description: '',
    times: '',
    discountPercent: '',
    selectedServices: []
  });

  useEffect(() => {
    fetchPromotions();
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await authenticatedFetch('/api/spa/services?limit=1000&isActive=true');
      const data = await response.json();

      if (data.status === 200) {
        setServices(data.data.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/spa/promotions?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.status === 200) {
        setPromotions(data.data.promotions);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.msg || 'Failed to load promotions');
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        promotionName: promotion.promotionName || '',
        description: promotion.description || '',
        times: promotion.times || '',
        discountPercent: promotion.discountPercent || '',
        selectedServices: promotion.services || []
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        promotionName: '',
        description: '',
        times: '',
        discountPercent: '',
        selectedServices: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPromotion(null);
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
      if (!formData.promotionName || !formData.times || !formData.discountPercent) {
        setError('Promotion name, times, and discount percent are required');
        return;
      }

      if (formData.selectedServices.length === 0) {
        setError('Please select at least one service');
        return;
      }

      const url = editingPromotion
        ? `/api/spa/promotions/${editingPromotion._id}`
        : '/api/spa/promotions';

      const method = editingPromotion ? 'PUT' : 'POST';

      // Prepare data with service IDs
      const submitData = {
        ...formData,
        serviceIds: formData.selectedServices.map(s => s._id)
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        setSuccess(editingPromotion ? 'Promotion updated successfully' : 'Promotion created successfully');
        handleCloseDialog();
        fetchPromotions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to save promotion');
      }
    } catch (err) {
      console.error('Error saving promotion:', err);
      setError('Failed to save promotion');
    }
  };

  const handleDelete = async (promotionId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/spa/promotions/${promotionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 200) {
        setSuccess('Promotion deleted successfully');
        fetchPromotions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to delete promotion');
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError('Failed to delete promotion');
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

  return (
    <PageContainer title="Promotions" description="Manage spa promotions">
      <Breadcrumb title="Promotions" items={BCrumb} />

      <Box mt={3}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Promotion List</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Promotion
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Search by promotion name..."
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
                        <TableCell>Promotion Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Services</TableCell>
                        <TableCell align="center">Times</TableCell>
                        <TableCell align="center">Discount</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {promotions.length > 0 ? (
                        promotions.map((promotion) => (
                          <TableRow key={promotion._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {promotion.promotionName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {promotion.description || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {promotion.services && promotion.services.length > 0 ? (
                                  promotion.services.slice(0, 3).map((service) => (
                                    <Chip
                                      key={service._id}
                                      label={service.name}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="textSecondary">-</Typography>
                                )}
                                {promotion.services && promotion.services.length > 3 && (
                                  <Chip
                                    label={`+${promotion.services.length - 3} more`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={`${promotion.times}x`} color="primary" size="small" />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={`${promotion.discountPercent}%`} color="success" size="small" />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={promotion.isActive ? 'Active' : 'Inactive'}
                                color={promotion.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenDialog(promotion)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(promotion._id)}
                                title="Delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="textSecondary" py={3}>
                              No promotions found
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
          {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <Autocomplete
                multiple
                options={services}
                getOptionLabel={(option) => `${option.name} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.basePrice)}`}
                value={formData.selectedServices}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    selectedServices: newValue
                  }));
                }}
                loading={servicesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Services"
                    placeholder="Search and select services..."
                    helperText="Select which services this promotion applies to"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Promotion Name *"
                name="promotionName"
                value={formData.promotionName}
                onChange={handleInputChange}
                placeholder="e.g. 5 Times Package"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Times *"
                name="times"
                type="number"
                value={formData.times}
                onChange={handleInputChange}
                placeholder="e.g. 5"
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Discount Percent *"
                name="discountPercent"
                type="number"
                value={formData.discountPercent}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                placeholder="e.g. 10"
              />
            </Grid>
            
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPromotion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PromotionsPage;
