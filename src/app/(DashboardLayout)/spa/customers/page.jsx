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
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Customers' },
];

const CustomersPage = () => {
  const router = useRouter();
  const { authenticatedFetch } = useAuth();

  const [customers, setCustomers] = useState([]);
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
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/spa/customers?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.status === 200) {
        setCustomers(data.data.customers);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.msg || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        firstName: customer.firstName || '',
        middleName: customer.middleName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validation
      if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.dateOfBirth) {
        setError('Please fill in all required fields');
        return;
      }

      const url = editingCustomer
        ? `/api/spa/customers/${editingCustomer._id}`
        : '/api/spa/customers';

      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        setSuccess(editingCustomer ? 'Customer updated successfully' : 'Customer created successfully');
        handleCloseDialog();
        fetchCustomers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to save customer');
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      setError('Failed to save customer');
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/spa/customers/${customerId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 200) {
        setSuccess('Customer deleted successfully');
        fetchCustomers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.msg || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer');
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
    <PageContainer title="Customers" description="Manage spa customers">
      <Breadcrumb title="Customers" items={BCrumb} />

      <Box mt={3}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Customer List</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Customer
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Search by name, phone, or email..."
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
                        <TableCell>Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Remaining Services</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <TableRow key={customer._id} hover>
                            <TableCell>
                              {customer.firstName} {customer.middleName} {customer.lastName}
                            </TableCell>
                            <TableCell>{customer.phoneNumber}</TableCell>
                            <TableCell>{customer.email || '-'}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={customer.totalRemainingServices || 0}
                                color={customer.totalRemainingServices > 0 ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={customer.isActive ? 'Active' : 'Inactive'}
                                color={customer.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => router.push(`/spa/customers/${customer._id}`)}
                                title="View Details"
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenDialog(customer)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(customer._id)}
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
                              No customers found
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={4}>
              <TextField
                fullWidth
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={2}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </Grid>
           <Grid size={4}>
              <TextField
                fullWidth
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </Grid>
           <Grid size={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Date of Birth *"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Street Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
            </Grid>
           <Grid size={6}>
              <TextField
                fullWidth
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
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
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default CustomersPage;
