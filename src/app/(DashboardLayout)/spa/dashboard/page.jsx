'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  EventAvailable as EventIcon,
  TrendingUp as TrendingIcon,
  Spa as SpaIcon,
  Add as AddIcon,
  LocalOffer as PromotionIcon,
  CardGiftcard as PackageIcon,
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/components/container/PageContainer';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Spa Dashboard',
  },
];

const SpaDashboard = () => {
  const router = useRouter();
  const { authenticatedFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/spa/dashboard/stats');
      const data = await response.json();

      if (data.status === 200) {
        setStats(data.data);
      } else {
        setError(data.msg || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <PageContainer title="Spa Dashboard" description="Spa management dashboard">
        <Breadcrumb title="Spa Dashboard" items={BCrumb} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Spa Dashboard" description="Spa management dashboard">
        <Breadcrumb title="Spa Dashboard" items={BCrumb} />
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Spa Dashboard" description="Spa management dashboard">
      <Breadcrumb title="Spa Dashboard" items={BCrumb} />

      <Box mt={3}>
        {/* Quick Access Cards */}
        <Typography variant="h5" mb={2}>Quick Access</Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push('/spa/customers')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Customers</Typography>
                <Typography variant="h4" color="primary.main" mt={1}>
                  {stats?.overview?.totalCustomers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push('/spa/services')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <SpaIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">Services</Typography>
                <Typography variant="h4" color="success.main" mt={1}>
                  {stats?.counts?.services || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push('/spa/promotions')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PromotionIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6">Promotions</Typography>
                <Typography variant="h4" color="warning.main" mt={1}>
                  {stats?.counts?.promotions || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push('/spa/service-promotions')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PackageIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6">Packages</Typography>
                <Typography variant="h4" color="info.main" mt={1}>
                  {stats?.counts?.servicePromotions || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push('/spa/usage')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <HistoryIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6">Usage</Typography>
                <Typography variant="h4" color="secondary.main" mt={1}>
                  {stats?.usage?.thisMonth || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push('/spa/customers')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h6">Active</Typography>
                <Typography variant="h4" color="error.main" mt={1}>
                  {stats?.overview?.customersWithRemaining || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Statistics Cards */}
        <Typography variant="h5" mb={2}>Overview Statistics</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total Customers
                    </Typography>
                    <Typography variant="h3">
                      {stats?.overview?.totalCustomers || 0}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 50, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Customers with Services
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {stats?.overview?.customersWithRemaining || 0}
                    </Typography>
                  </Box>
                  <SpaIcon sx={{ fontSize: 50, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Active Packages
                    </Typography>
                    <Typography variant="h3" color="warning.main">
                      {stats?.overview?.totalActivePackages || 0}
                    </Typography>
                  </Box>
                  <EventIcon sx={{ fontSize: 50, color: 'warning.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      This Month Revenue
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {formatCurrency(stats?.overview?.thisMonthRevenue || 0)}
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 50, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Service Usage Stats */}
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Services Used Today
                </Typography>
                <Typography variant="h3">{stats?.usage?.today || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  This Week
                </Typography>
                <Typography variant="h3">{stats?.usage?.thisWeek || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h3">{stats?.usage?.thisMonth || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customers with Remaining Services */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Customers with Remaining Services</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/spa/usage')}
              >
                Record Usage
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="center">Remaining Services</TableCell>
                    <TableCell align="center">Active Packages</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.customersWithRemaining?.length > 0 ? (
                    stats.customersWithRemaining.map((item) => (
                      <TableRow key={item.customer._id} hover>
                        <TableCell>
                          {item.customer.firstName} {item.customer.middleName} {item.customer.lastName}
                        </TableCell>
                        <TableCell>{item.customer.phoneNumber}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.totalRemaining}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{item.packages.length}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => router.push(`/spa/customers/${item.customer._id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary">No customers with remaining services</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Top Services */}
        {stats?.topServices && stats.topServices.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" mb={2}>Top Services by Usage</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Service Name</TableCell>
                      <TableCell align="right">Times Used</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topServices.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.serviceName}</TableCell>
                        <TableCell align="right">
                          <Chip label={service.count} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        {stats?.recentActivities && stats.recentActivities.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" mb={2}>Recent Service Usage</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Staff</TableCell>
                      <TableCell align="center">Remaining</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivities.map((activity) => (
                      <TableRow key={activity._id} hover>
                        <TableCell>
                          {activity.customerId?.firstName} {activity.customerId?.lastName}
                        </TableCell>
                        <TableCell>
                          {activity.customerPurchaseId?.servicePromotionId?.serviceName || 'N/A'}
                        </TableCell>
                        <TableCell>{formatDateTime(activity.usingDateTime)}</TableCell>
                        <TableCell>{activity.staffMember || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={activity.remainingAfterUse}
                            color={activity.remainingAfterUse > 0 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </PageContainer>
  );
};

export default SpaDashboard;
