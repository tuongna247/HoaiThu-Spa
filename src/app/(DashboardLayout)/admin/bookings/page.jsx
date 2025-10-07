'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  IconEye,
  IconSearch,
  IconFilter,
  IconDownload,
  IconCalendar,
  IconUser,
  IconMapPin,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';
import { useAuth } from '@/contexts/AuthContext';

const BookingListPage = () => {
  const { authenticatedFetch } = useAuth();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Initialize search term from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [page, rowsPerPage, searchTerm, statusFilter, paymentFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (searchTerm) {
        // Check if search term looks like a booking reference (starts with letters/numbers)
        if (searchTerm.match(/^[A-Z0-9-]+$/i)) {
          params.append('bookingId', searchTerm);
        } else {
          params.append('email', searchTerm);
        }
      }
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await authenticatedFetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (data.status === 200) {
        setBookings(data.data.bookings);
        setTotalBookings(data.data.pagination.total);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      case 'refunded': return 'secondary';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'processing': return 'info';
      case 'refunded': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const exportBookings = () => {
    // Create CSV content
    const headers = ['Booking ID', 'Customer', 'Tour', 'Date', 'Status', 'Payment Status', 'Total'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(booking => [
        booking.bookingReference || booking.bookingId,
        `"${booking.customer.firstName} ${booking.customer.lastName}"`,
        `"${booking.tour.title}"`,
        new Date(booking.createdAt).toLocaleDateString(),
        booking.status,
        booking.payment.status,
        booking.pricing.total
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <RoleBasedAccess allowedRoles={['admin']}>
      <PageContainer title="Booking List" description="Manage all tour bookings">
        <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <IconCalendar />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <IconUser />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.confirmed}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirmed
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <IconCalendar />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.pending}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <IconCalendar />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.cancelled}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cancelled
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <IconCurrencyDollar />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">${stats.totalRevenue?.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <DashboardCard title="All Bookings">
          {/* Filters */}
          <Box mb={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search by email or booking reference..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <IconSearch size="20" />,
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Payment</InputLabel>
                <Select
                  value={paymentFilter}
                  label="Payment"
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <MenuItem value="">All Payments</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<IconDownload />}
                onClick={exportBookings}
              >
                Export CSV
              </Button>
            </Stack>
          </Box>

          {/* Bookings Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Tour</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.bookingReference || booking.bookingId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {booking.customer.firstName} {booking.customer.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.customer.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.tour.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(booking.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.participants.totalCount} people
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status} 
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.payment.status} 
                          color={getPaymentStatusColor(booking.payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          ${booking.pricing.total}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <IconEye />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalBookings}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DashboardCard>

        {/* Booking Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Booking Details - {selectedBooking?.bookingReference || selectedBooking?.bookingId}
          </DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Customer Information</Typography>
                    <Typography><strong>Name:</strong> {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}</Typography>
                    <Typography><strong>Email:</strong> {selectedBooking.customer.email}</Typography>
                    <Typography><strong>Phone:</strong> {selectedBooking.customer.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Tour Information</Typography>
                    <Typography><strong>Tour:</strong> {selectedBooking.tour.title}</Typography>
                    <Typography><strong>Date:</strong> {new Date(selectedBooking.tour.selectedDate).toLocaleDateString()}</Typography>
                    <Typography><strong>Time:</strong> {selectedBooking.tour.selectedTimeSlot}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Participants</Typography>
                    <Typography><strong>Adults:</strong> {selectedBooking.participants.adults}</Typography>
                    <Typography><strong>Children:</strong> {selectedBooking.participants.children}</Typography>
                    <Typography><strong>Infants:</strong> {selectedBooking.participants.infants}</Typography>
                    <Typography><strong>Total:</strong> {selectedBooking.participants.totalCount}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Payment Details</Typography>
                    <Typography><strong>Subtotal:</strong> ${selectedBooking.pricing.subtotal}</Typography>
                    <Typography><strong>Taxes:</strong> ${selectedBooking.pricing.taxes}</Typography>
                    <Typography><strong>Total:</strong> ${selectedBooking.pricing.total}</Typography>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={selectedBooking.payment.status} 
                        color={getPaymentStatusColor(selectedBooking.payment.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  {selectedBooking.specialRequests && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Special Requests</Typography>
                      <Typography>{selectedBooking.specialRequests}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        </Box>
      </PageContainer>
    </RoleBasedAccess>
  );
};

export default BookingListPage;