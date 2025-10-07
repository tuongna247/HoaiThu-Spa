'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Rating,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ImageList,
  ImageListItem,
  Tab,
  Tabs,
  Paper,
  Skeleton,
  IconButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tour-tabpanel-${index}`}
    aria-labelledby={`tour-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ReviewCard = ({ review }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={review.user.avatar} sx={{ mr: 2 }}>
          {review.user.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2">{review.user.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={review.rating} size="small" readOnly sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(review.date).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Typography variant="body2">{review.comment}</Typography>
    </CardContent>
  </Card>
);

const TourDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTour();
    }
  }, [id]);

  const fetchTour = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tours/${id}`);
      const data = await response.json();

      if (data.status === 200) {
        setTour(data.data);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('Failed to fetch tour details');
      console.error('Error fetching tour:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    router.push(`/tours/${id}/booking`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, save to backend
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tour?.title,
        text: tour?.shortDescription,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Tour Details" description="Tour details and booking">
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    );
  }

  if (error || !tour) {
    return (
      <PageContainer title="Tour Not Found" description="Tour not found">
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Tour Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error || 'The tour you are looking for does not exist.'}
          </Typography>
          <Button variant="contained" onClick={() => router.push('/tours')}>
            Browse All Tours
          </Button>
        </Box>
      </PageContainer>
    );
  }

  const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/tours', title: 'Tours' },
    { title: tour.title },
  ];

  const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];

  return (
    <PageContainer title={tour.title} description={tour.shortDescription}>
      <Breadcrumb title={tour.title} items={BCrumb} />
      
      <Box sx={{ mt: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {tour.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {tour.location.city}, {tour.location.country}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={tour.rating.average} precision={0.1} readOnly size="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    ({tour.rating.count} reviews)
                  </Typography>
                </Box>
                <Chip label={tour.category} color="primary" size="small" />
                {tour.isFeatured && <Chip label="Featured" color="secondary" size="small" />}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Main Image */}
        {primaryImage && (
          <Card sx={{ mb: 3 }}>
            <Box
              component="img"
              sx={{
                height: 400,
                width: '100%',
                objectFit: 'cover',
              }}
              alt={tour.title}
              src={primaryImage.url}
            />
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="Overview" />
                  <Tab label="Itinerary" />
                  <Tab label="Reviews" />
                  <Tab label="Gallery" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Typography variant="body1" paragraph>
                    {tour.description}
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Highlights
                  </Typography>
                  <List dense>
                    {tour.highlights?.map((highlight, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <StarIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={highlight} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    What&apos;s Included
                  </Typography>
                  <List dense>
                    {tour.included?.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    What&apos;s Not Included
                  </Typography>
                  <List dense>
                    {tour.notIncluded?.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CancelIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Itinerary
                  </Typography>
                  {tour.itinerary?.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary.main">
                        {item.time}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        {item.activity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      {index < tour.itinerary.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" gutterBottom>
                    Reviews ({tour.rating.count})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Rating value={tour.rating.average} precision={0.1} readOnly sx={{ mr: 2 }} />
                    <Typography variant="h6">{tour.rating.average.toFixed(1)}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      out of 5 stars
                    </Typography>
                  </Box>
                  {tour.reviews?.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                  ))}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  {tour.images && tour.images.length > 0 && (
                    <ImageList variant="masonry" cols={3} gap={8}>
                      {tour.images.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={image.url}
                            alt={image.alt || tour.title}
                            loading="lazy"
                            style={{ borderRadius: 8 }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                    {tour.originalPrice && tour.originalPrice > tour.price && (
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}
                      >
                        ${tour.originalPrice}
                      </Typography>
                    )}
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      ${tour.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      /person
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Duration: {tour.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GroupIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Group size: {tour.capacity?.minimum || tour.groupSize?.min || 1}-{tour.capacity?.maximum || tour.groupSize?.max || 20} people
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Difficulty: {tour.difficulty}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleBookNow}
                  sx={{ mb: 2 }}
                >
                  Book Now
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => router.push('/tours')}
                >
                  Back to Tours
                </Button>

                {tour.cancellationPolicy && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Cancellation Policy
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tour.cancellationPolicy}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default TourDetailPage;