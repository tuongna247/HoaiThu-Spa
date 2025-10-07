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
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Tours',
  },
];

const TourCard = ({ tour, onFavoriteToggle }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleBookNow = () => {
    router.push(`/tours/${tour._id}/booking`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(tour._id, !isFavorite);
  };

  const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={primaryImage?.url || '/images/tours/default-tour.jpg'}
          alt={tour.title}
          sx={{ objectFit: 'cover' }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
          }}
          onClick={toggleFavorite}
        >
          {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        {tour.isFeatured && (
          <Chip
            label="Featured"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {tour.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {tour.shortDescription}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {tour.location.city}, {tour.location.country}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {tour.duration}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Max {tour.capacity?.maximum || tour.groupSize?.max || 20} people
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating
            value={tour.rating.average}
            precision={0.1}
            readOnly
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            ({tour.rating.count} reviews)
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              {tour.originalPrice && tour.originalPrice > tour.price && (
                <Typography
                  variant="body2"
                  sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                >
                  ${tour.originalPrice}
                </Typography>
              )}
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                ${tour.price}
                <Typography component="span" variant="body2" color="text.secondary">
                  /person
                </Typography>
              </Typography>
            </Box>
            <Chip
              label={tour.category}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              component={Link}
              href={`/tours/${tour._id}`}
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
              Book Now
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const TourSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="50%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rectangular" width={60} height={24} />
      </Box>
    </CardContent>
  </Card>
);

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    featured: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const categories = ['Adventure', 'Cultural', 'Historical', 'Nature', 'Food & Drink', 'Family', 'Romantic'];

  const fetchTours = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page);
      queryParams.append('limit', pagination.limit);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/tours?${queryParams}`);
      const data = await response.json();

      if (data.status === 200) {
        setTours(data.data.tours);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        }));
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('Failed to fetch tours');
      console.error('Error fetching tours:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [pagination.page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFavoriteToggle = (tourId, isFavorite) => {
    // In a real app, you'd save favorites to user preferences or backend
    console.log(`Tour ${tourId} ${isFavorite ? 'added to' : 'removed from'} favorites`);
  };

  return (
    <PageContainer title="Tours" description="Browse and book amazing day trips and tours">
      <Breadcrumb title="Tours" items={BCrumb} />
      
      <Box sx={{ mt: 3 }}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search tours..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 1 }}>
                <Button
                  variant={filters.featured ? 'contained' : 'outlined'}
                  onClick={() => handleFilterChange('featured', !filters.featured)}
                  startIcon={<StarIcon />}
                  size="small"
                >
                  Featured
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {!loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Showing {tours.length} of {pagination.total} tours
            </Typography>
          </Box>
        )}

        {/* Tours Grid */}
        {error ? (
          <Card>
            <CardContent>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(9)).map((_, index) => (
                  <Grid size={{ xs: 4, sm: 4, md: 4 }} key={index}>
                    <TourSkeleton />
                  </Grid>
                ))
              : tours.map((tour) => (
                  <Grid size={{ xs: 4, sm: 4, md: 4 }} key={tour._id}>
                    <TourCard tour={tour} onFavoriteToggle={handleFavoriteToggle} />
                  </Grid>
                ))}
          </Grid>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default ToursPage;