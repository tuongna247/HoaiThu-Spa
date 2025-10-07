'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/contexts/AuthContext';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/admin',
    title: 'Admin',
  },
  {
    title: 'Tour Management',
  },
];

export default function AdminToursPage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuth();
  const [tours, setTours] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tour: null });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch tours
  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await authenticatedFetch(`/api/admin/tours?${params}`);
      const data = await response.json();

      if (data.status === 200) {
        setTours(data.data.tours);
        setStats(data.data.stats);
      } else {
        showAlert('Failed to fetch tours', 'error');
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      showAlert('Error fetching tours', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [page, rowsPerPage, search, statusFilter, categoryFilter]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ open: false, message: '', severity: 'success' }), 3000);
  };

  const handleDeleteTour = async (tourId) => {
    try {
      const response = await authenticatedFetch(`/api/admin/tours/${tourId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showAlert('Tour deleted successfully');
        fetchTours();
      } else {
        showAlert('Failed to delete tour', 'error');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      showAlert('Error deleting tour', 'error');
    } finally {
      setDeleteDialog({ open: false, tour: null });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <PageContainer title="Tour Management" description="Manage tours">
      <Breadcrumb title="Tour Management" items={BCrumb} />
      
      {alert.open && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tours
              </Typography>
              <Typography variant="h4">
                {stats.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tours
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.active || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Featured Tours
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.featured || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h4">
                {stats.categories?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search tours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {stats.categories?.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/admin/tours/new')}
                >
                  Add New Tour
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tour</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No tours found
                  </TableCell>
                </TableRow>
              ) : (
                tours.map((tour) => (
                  <TableRow key={tour._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={tour.images?.[0]?.url}
                          alt={tour.title}
                          sx={{ width: 50, height: 50 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {tour.title}
                            {tour.isFeatured && (
                              <StarIcon sx={{ ml: 1, color: 'warning.main', fontSize: 16 }} />
                            )}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {tour.duration}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {tour.location.city}, {tour.location.country}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" color="primary">
                        {formatPrice(tour.price, tour.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tour.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tour.isActive ? 'Active' : 'Inactive'}
                        color={getStatusColor(tour.isActive)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" color="warning" />
                        <Typography variant="body2">
                          {(tour.rating?.average || 0).toFixed(1)} ({tour.rating?.count || 0})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Tour">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/tours/${tour._id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Tour">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/admin/tours/${tour._id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Tour">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, tour })}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={stats.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, tour: null })}
      >
        <DialogTitle>Delete Tour</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteDialog.tour?.title}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, tour: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDeleteTour(deleteDialog.tour?._id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}