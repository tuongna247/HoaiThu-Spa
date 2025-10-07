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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import { useAuth } from '@/contexts/AuthContext';

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

export default function EditTourPage() {
  const { authenticatedFetch } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tourId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState(null);

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
      title: 'Edit Tour',
    },
  ];

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch(`/api/admin/tours/${tourId}`);
        const data = await response.json();

        if (data.status === 200) {
          const tourData = data.data;
          // Ensure arrays exist with default values
          setFormData({
            ...tourData,
            included: tourData.included || [''],
            excluded: tourData.excluded || [''],
            highlights: tourData.highlights || [''],
            images: tourData.images || [{ url: '', alt: '', isPrimary: true }]
          });
        } else {
          showAlert('Failed to fetch tour data', 'error');
        }
      } catch (error) {
        console.error('Error fetching tour:', error);
        showAlert('Error fetching tour data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (tourId) {
      fetchTour();
    }
  }, [tourId]);

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
      setSaving(true);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || !formData.location?.city) {
        showAlert('Please fill in all required fields', 'error');
        setSaving(false);
        return;
      }

      // Clean up arrays (remove empty strings)
      const cleanFormData = {
        ...formData,
        included: formData.included.filter(item => item.trim()),
        excluded: formData.excluded.filter(item => item.trim()),
        highlights: formData.highlights.filter(item => item.trim()),
        images: formData.images.filter(img => img.url && img.url.trim())
      };

      const response = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData),
      });

      const data = await response.json();

      if (data.status === 200) {
        showAlert('Tour updated successfully!');
        setTimeout(() => {
          router.push('/admin/tours');
        }, 1500);
      } else {
        showAlert(data.msg || 'Failed to update tour', 'error');
      }
    } catch (error) {
      console.error('Error updating tour:', error);
      showAlert('Error updating tour', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Edit Tour" description="Edit tour details">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!formData) {
    return (
      <PageContainer title="Edit Tour" description="Edit tour details">
        <Alert severity="error">Tour not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Edit Tour" description="Edit tour details">
      <Breadcrumb title="Edit Tour" items={BCrumb} />
      
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
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Tour'}
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
                    value={formData.shortDescription || ''}
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
                    value={formData.originalPrice || ''}
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
                    value={formData.location.state || ''}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.location.address || ''}
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
              {formData.included && formData.included.map((item, index) => (
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
              {formData.excluded && formData.excluded.map((item, index) => (
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
              {formData.highlights && formData.highlights.map((item, index) => (
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
                value={formData.subcategory || ''}
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
                    checked={formData.isFeatured || false}
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
                    value={formData.capacity?.minimum || 1}
                    onChange={(e) => handleInputChange('capacity.minimum', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Maximum"
                    type="number"
                    value={formData.capacity?.maximum || 20}
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
                value={formData.schedule?.meetingPoint || ''}
                onChange={(e) => handleInputChange('schedule.meetingPoint', e.target.value)}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    value={formData.schedule?.startTime || '09:00 AM'}
                    onChange={(e) => handleInputChange('schedule.startTime', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="End Time"
                    value={formData.schedule?.endTime || '05:00 PM'}
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