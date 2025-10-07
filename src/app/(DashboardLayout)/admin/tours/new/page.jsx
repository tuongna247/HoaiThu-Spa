'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
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
    to: '/admin/tours',
    title: 'Tour Management',
  },
  {
    title: 'Add New Tour',
  },
];

const categories = [
  'Cultural',
  'Adventure',
  'Food & Drink',
  'Nature',
  'Historical',
  'Entertainment',
  'Sports',
  'Relaxation'
];

const difficulties = ['Easy', 'Medium', 'Hard'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
const timeSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AddNewTourPage() {
  const { authenticatedFetch } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    duration: '8 hours',
    price: '',
    originalPrice: '',
    currency: 'USD',
    category: 'Cultural',
    subcategory: '',
    location: {
      country: '',
      state: '',
      city: '',
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    images: [{ url: '', alt: '', isPrimary: true }],
    schedule: {
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      meetingPoint: '',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '02:00 PM']
    },
    capacity: {
      minimum: 1,
      maximum: 20
    },
    included: [''],
    excluded: [''],
    highlights: [''],
    difficulty: 'Easy',
    ageRestriction: {
      minimum: 0,
      maximum: 99
    },
    cancellation: {
      policy: 'Free cancellation up to 24 hours before',
      refundable: true,
      cutoffHours: 24
    },
    guide: {
      name: '',
      bio: '',
      image: '/images/profile/user-1.jpg',
      languages: ['English'],
      rating: 4.8,
      experience: ''
    },
    tags: [],
    isActive: true,
    isFeatured: false,
    booking: {
      instantBooking: true,
      requiresApproval: false,
      advanceBooking: 1
    }
  });

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ open: false, message: '', severity: 'success' }), 3000);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || !formData.location?.city) {
        showAlert('Please fill in all required fields', 'error');
        setLoading(false);
        return;
      }

      // Clean up arrays (remove empty strings)
      const cleanFormData = {
        ...formData,
        included: formData.included.filter(item => item.trim()),
        excluded: formData.excluded.filter(item => item.trim()),
        highlights: formData.highlights.filter(item => item.trim()),
        images: formData.images.filter(img => img.url.trim())
      };

      const response = await authenticatedFetch('/api/admin/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData),
      });

      const data = await response.json();

      if (data.status === 201) {
        showAlert('Tour created successfully!');
        setTimeout(() => {
          router.push('/admin/tours');
        }, 1500);
      } else {
        showAlert(data.msg || 'Failed to create tour', 'error');
      }
    } catch (error) {
      console.error('Error creating tour:', error);
      showAlert('Error creating tour', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Add New Tour" description="Create a new tour">
      <Breadcrumb title="Add New Tour" items={BCrumb} />
      
      {alert.open && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Back to Tours
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.push('/admin/tours')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Tour'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Tour Title *"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={formData.difficulty}
                      label="Difficulty"
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    >
                      {difficulties.map((difficulty) => (
                        <MenuItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description *"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    label="Short Description"
                    multiline
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    helperText="Brief summary for cards and previews"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 8 hours, Full day"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    label="Price *"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    label="Original Price"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    helperText="For discounted tours"
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      label="Currency"
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Location */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Country *"
                    value={formData.location.country}
                    onChange={(e) => handleInputChange('location.country', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="City *"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.location.address}
                    onChange={(e) => handleInputChange('location.address', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* What's Included/Excluded */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tour Details
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                What&apos;s Included
              </Typography>
              {formData.included.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={item}
                    onChange={(e) => handleArrayChange('included', index, e.target.value)}
                    placeholder="e.g., Professional guide"
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeArrayItem('included', index)}
                    disabled={formData.included.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('included')}
              >
                Add Item
              </Button>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                What&apos;s Excluded
              </Typography>
              {formData.excluded.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={item}
                    onChange={(e) => handleArrayChange('excluded', index, e.target.value)}
                    placeholder="e.g., Meals"
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeArrayItem('excluded', index)}
                    disabled={formData.excluded.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('excluded')}
              >
                Add Item
              </Button>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Highlights
              </Typography>
              {formData.highlights.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={item}
                    onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                    placeholder="e.g., Amazing views"
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeArrayItem('highlights', index)}
                    disabled={formData.highlights.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('highlights')}
              >
                Add Highlight
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category & Settings
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  />
                }
                label="Featured"
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Capacity
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Minimum"
                    type="number"
                    value={formData.capacity.minimum}
                    onChange={(e) => handleInputChange('capacity.minimum', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Maximum"
                    type="number"
                    value={formData.capacity.maximum}
                    onChange={(e) => handleInputChange('capacity.maximum', parseInt(e.target.value))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Schedule
              </Typography>
              <TextField
                fullWidth
                label="Meeting Point"
                value={formData.schedule.meetingPoint}
                onChange={(e) => handleInputChange('schedule.meetingPoint', e.target.value)}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    value={formData.schedule.startTime}
                    onChange={(e) => handleInputChange('schedule.startTime', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="End Time"
                    value={formData.schedule.endTime}
                    onChange={(e) => handleInputChange('schedule.endTime', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}