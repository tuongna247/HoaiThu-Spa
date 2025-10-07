'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  IconButton,
  Skeleton,
  Pagination,
  Stack,
  InputAdornment,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Login as LoginIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';

const TourCard = ({ tour, onFavoriteToggle, isAuthenticated }) => {
  const router = useRouter();

  const handleBookNow = () => {
    if (isAuthenticated) {
      router.push(`/tours/${tour._id}/booking`);
    } else {
      // For non-authenticated users, redirect to login first
      router.push(`/auth/auth1/login?redirect=/tours/${tour._id}/booking`);
    }
  };

  const handleViewDetails = () => {
    router.push(`/tours/${tour._id}`);
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={tour._id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[8],
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={tour.images?.[0]?.url || '/images/tours/default-tour.jpg'}
          alt={tour.title}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {tour.title}
            </Typography>
            {isAuthenticated && onFavoriteToggle && (
              <IconButton 
                onClick={() => onFavoriteToggle(tour._id, tour.isFavorite)}
                size="small"
                sx={{ color: tour.isFavorite ? 'error.main' : 'grey.400' }}
              >
                {tour.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <LocationIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {tour.location?.city}, {tour.location?.country}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <TimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {tour.duration}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <GroupIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Max {tour.capacity?.maximum || 20}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Rating 
              value={tour.rating?.average || 0} 
              readOnly 
              size="small" 
              precision={0.1}
            />
            <Typography variant="body2" color="text.secondary">
              ({tour.rating?.count || 0} reviews)
            </Typography>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {tour.description}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {tour.difficulty && (
              <Chip 
                label={tour.difficulty} 
                size="small" 
                color={
                  tour.difficulty === 'Easy' ? 'success' : 
                  tour.difficulty === 'Moderate' ? 'warning' : 'error'
                }
              />
            )}
            {tour.category && (
              <Chip label={tour.category} size="small" variant="outlined" />
            )}
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" mt="auto">
            <Box display="flex" alignItems="center" gap={0.5}>
              <MoneyIcon color="primary" fontSize="small" />
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${tour.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                /person
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1} mt={2}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleViewDetails}
              sx={{ flex: 1 }}
            >
              View Details
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleBookNow}
              sx={{ flex: 1 }}
            >
              {isAuthenticated ? 'Book Now' : 'Login to Book'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

const PublicToursPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { data: session } = useSession();
  
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isUserAuthenticated = isAuthenticated || session?.user;
  const currentUser = user || session?.user;

  useEffect(() => {
    fetchTours();
  }, [searchTerm, locationFilter, categoryFilter, sortBy, currentPage]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(locationFilter && { location: locationFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(sortBy && { sort: sortBy })
      });

      const response = await fetch(`/api/tours?${queryParams}`);
      const data = await response.json();

      if (data.status === 200) {
        setTours(data.data.tours || []);
        setTotalPages(data.data.totalPages || 1);
      } else {
        setError(data.msg || 'Failed to fetch tours');
      }
    } catch (err) {
      setError('Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (tourId, isFavorite) => {
    if (!isUserAuthenticated) {
      router.push('/auth/auth1/login');
      return;
    }

    try {
      const response = await fetch(`/api/tours/${tourId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isFavorite: !isFavorite })
      });

      if (response.ok) {
        setTours(tours.map(tour => 
          tour._id === tourId 
            ? { ...tour, isFavorite: !isFavorite }
            : tour
        ));
      }
    } catch (err) {
      // Handle error silently for non-authenticated users
    }
  };

  const handleLogin = () => {
    router.push('/auth/auth1/login');
  };

  const handleDashboard = () => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'mod') {
      router.push('/dashboard-main');
    } else {
      router.push('/tours'); // Stay on tours for customers
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Public Header */}
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary' }} elevation={1}>
        <Container maxWidth="lg">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
              LeeTour
            </Typography>
            
            {isUserAuthenticated ? (
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">
                  Welcome, {currentUser?.name || currentUser?.username}
                </Typography>
                {(currentUser?.role === 'admin' || currentUser?.role === 'mod') && (
                  <Button 
                    startIcon={<AccountIcon />}
                    onClick={handleDashboard}
                    variant="outlined"
                    size="small"
                  >
                    Dashboard
                  </Button>
                )}
              </Box>
            ) : (
              <Button 
                startIcon={<LoginIcon />}
                onClick={handleLogin}
                variant="contained"
                size="small"
              >
                Login
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Discover Amazing Tours
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Explore the world with our carefully curated travel experiences
          </Typography>
        </Box>

        {/* Filters */}
        <Box mb={4}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={locationFilter}
                  label="Location"
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="Paris">Paris</MenuItem>
                  <MenuItem value="Tokyo">Tokyo</MenuItem>
                  <MenuItem value="New York">New York</MenuItem>
                  <MenuItem value="London">London</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Adventure">Adventure</MenuItem>
                  <MenuItem value="Cultural">Cultural</MenuItem>
                  <MenuItem value="Food & Drink">Food & Drink</MenuItem>
                  <MenuItem value="Nature">Nature</MenuItem>
                  <MenuItem value="Historical">Historical</MenuItem>
                  <MenuItem value="Entertainment">Entertainment</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="latest">Latest</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Error Message */}
        {error && (
          <Box mb={4}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        {/* Tours Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" width="100%" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Grid container spacing={3}>
              {tours.map((tour) => (
                <TourCard 
                  key={tour._id} 
                  tour={tour} 
                  onFavoriteToggle={handleFavoriteToggle}
                  isAuthenticated={isUserAuthenticated}
                />
              ))}
            </Grid>

            {tours.length === 0 && !loading && (
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                  No tours found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default PublicToursPage;