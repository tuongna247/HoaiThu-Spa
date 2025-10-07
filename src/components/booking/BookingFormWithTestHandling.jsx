import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  Payment as PaymentIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import ErrorDisplay from '../ui/ErrorDisplay';
import TestStatusIndicator from '../test/TestStatusIndicator';
import { useTestNotifications } from '../../hooks/useTestNotifications';

const BookingFormWithTestHandling = ({ tourId, onSuccess = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [testStatus, setTestStatus] = useState('idle');
  
  const {
    notifyBookingTestStart,
    notifyBookingTestSuccess,
    notifyBookingTestError,
    notifyValidationError,
    notifyAPIConnectionError,
    notifyNetworkError
  } = useTestNotifications();
  const [formData, setFormData] = useState({
    tour: {
      tourId: tourId,
      title: '',
      price: 0,
      selectedDate: (() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Default to tomorrow to avoid past date issues
        return tomorrow.toISOString().split('T')[0];
      })(),
      selectedTimeSlot: '09:00 AM'
    },
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      }
    },
    participants: {
      adults: 1,
      children: 0,
      infants: 0,
      totalCount: 1
    },
    pricing: {
      basePrice: 0,
      adultPrice: 0,
      childPrice: 0,
      infantPrice: 0,
      subtotal: 0,
      taxes: 0,
      fees: 0,
      discount: 0,
      total: 0,
      currency: 'USD'
    },
    payment: {
      method: '',
      status: 'pending'
    },
    specialRequests: ''
  });

  const steps = [
    { label: 'Customer Info', icon: <PersonIcon /> },
    { label: 'Participants', icon: <GroupIcon /> },
    { label: 'Payment', icon: <PaymentIcon /> },
    { label: 'Confirmation', icon: <SuccessIcon /> }
  ];

  // Clear any initial errors when component mounts and ensure form is properly initialized
  useEffect(() => {
    setErrors({});
  }, []);

  // Test the booking API endpoint
  const testBookingAPI = async () => {
    setTestStatus('running');
    setApiError(null);
    notifyBookingTestStart();
    
    try {
      // Test API connection first
      const testResponse = await fetch('/api/bookings/test');
      const testData = await testResponse.json();
      
      if (!testResponse.ok) {
        throw new Error(`API Test Failed: ${testData.msg || 'Unknown error'}`);
      }
      
      setTestStatus('success');
      notifyBookingTestSuccess();
      return true;
    } catch (error) {
      setTestStatus('error');
      const apiError = {
        message: error.message,
        status: error.status || 500,
        timestamp: new Date().toISOString()
      };
      setApiError(apiError);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        notifyNetworkError(() => testBookingAPI());
      } else if (error.message.includes('API Test Failed')) {
        notifyAPIConnectionError('/api/bookings/test', () => testBookingAPI());
      } else {
        notifyBookingTestError(error, () => testBookingAPI());
      }
      
      return false;
    }
  };

  // Validate form step
  const validateStep = (step) => {
    const newErrors = {};
    
    
    switch (step) {
      case 0: // Customer Info
        if (!formData.customer.firstName) newErrors.firstName = 'First name is required';
        if (!formData.customer.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.customer.email) newErrors.email = 'Email is required';
        if (!formData.customer.phone) newErrors.phone = 'Phone is required';
        const dateValue = formData.tour?.selectedDate;
        if (!dateValue || dateValue === '' || dateValue === null || dateValue === undefined) {
          newErrors.selectedDate = 'Tour date is required';
        } else {
          // Check if date is in the past
          try {
            const selectedDate = new Date(dateValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isNaN(selectedDate.getTime())) {
              newErrors.selectedDate = 'Please select a valid date';
            } else if (selectedDate < today) {
              newErrors.selectedDate = 'Please select a future date';
            }
          } catch (error) {
            newErrors.selectedDate = 'Please select a valid date';
          }
        }
        break;
        
      case 1: // Participants
        if (formData.participants.adults < 1) newErrors.adults = 'At least 1 adult required';
        break;
        
      case 2: // Payment
        if (!formData.payment.method) newErrors.paymentMethod = 'Payment method is required';
        break;
    }
    
    setErrors(newErrors);
    
    // Show validation errors as notifications
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors);
      notifyValidationError(errorMessages);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    setApiError(null);
    setTestStatus('running');

    try {
      // Calculate pricing
      const adults = formData.participants.adults;
      const children = formData.participants.children;
      const basePrice = 100; // Default price
      
      const subtotal = (adults * basePrice) + (children * basePrice * 0.8);
      const taxes = subtotal * 0.1;
      const fees = 5;
      const total = subtotal + taxes + fees;

      const bookingData = {
        ...formData,
        tour: {
          ...formData.tour,
          price: basePrice,
          selectedDate: formData.tour.selectedDate || new Date().toISOString().split('T')[0],
          selectedTimeSlot: formData.tour.selectedTimeSlot || '09:00 AM'
        },
        participants: {
          ...formData.participants,
          totalCount: adults + children + formData.participants.infants
        },
        pricing: {
          basePrice,
          adultPrice: basePrice,
          childPrice: basePrice * 0.8,
          infantPrice: 0,
          subtotal,
          taxes,
          fees,
          discount: 0,
          total,
          currency: 'USD'
        }
      };
      

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const responseData = await response.json();
      

      if (!response.ok) {
        console.error('Booking failed:', responseData);
        throw new Error(responseData.msg || responseData.error || 'Booking failed');
      }

      setTestStatus('success');
      setActiveStep(3); // Go to confirmation step
      
      const bookingId = responseData.data?.bookingId || responseData.data?.id;
      notifyBookingTestSuccess(bookingId);
      
      if (onSuccess) {
        onSuccess(responseData.data);
      }

    } catch (error) {
      setTestStatus('error');
      const bookingError = {
        message: error.message,
        status: error.status || 500,
        timestamp: new Date().toISOString(),
        errors: error.errors || []
      };
      setApiError(bookingError);
      
      if (error.message.includes('validation') || error.errors?.length > 0) {
        notifyValidationError(error.errors || error.message);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        notifyNetworkError(() => handleSubmit());
      } else {
        notifyBookingTestError(error, () => handleSubmit());
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    
    if (section === '') {
      // Handle top-level fields like specialRequests
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Handle nested fields
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
    
    // Clear related errors  
    const errorKey = section === 'tour' && field === 'selectedDate' ? 'selectedDate' : field;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  // Handle next step
  const handleNext = () => {
    
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Retry failed operation
  const handleRetry = () => {
    setApiError(null);
    setTestStatus('idle');
    if (activeStep === 3) {
      handleSubmit();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.customer.firstName}
                onChange={(e) => handleInputChange('customer', 'firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                data-testid="customer-firstName"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.customer.lastName}
                onChange={(e) => handleInputChange('customer', 'lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                data-testid="customer-lastName"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.customer.email}
                onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                data-testid="customer-email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.customer.phone}
                onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                data-testid="customer-phone"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tour Date"
                type="date"
                value={formData.tour.selectedDate}
                onChange={(e) => handleInputChange('tour', 'selectedDate', e.target.value)}
                error={!!errors.selectedDate}
                helperText={errors.selectedDate || `Selected: ${formData.tour.selectedDate || 'No date selected'}`}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: new Date().toISOString().split('T')[0] // Prevent past dates
                }}
                data-testid="tour-date"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Time Slot</InputLabel>
                <Select
                  value={formData.tour.selectedTimeSlot}
                  onChange={(e) => handleInputChange('tour', 'selectedTimeSlot', e.target.value)}
                  data-testid="tour-time-slot"
                >
                  <MenuItem value="09:00 AM">09:00 AM</MenuItem>
                  <MenuItem value="10:00 AM">10:00 AM</MenuItem>
                  <MenuItem value="11:00 AM">11:00 AM</MenuItem>
                  <MenuItem value="02:00 PM">02:00 PM</MenuItem>
                  <MenuItem value="03:00 PM">03:00 PM</MenuItem>
                  <MenuItem value="04:00 PM">04:00 PM</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.adults}>
                <InputLabel>Adults</InputLabel>
                <Select
                  value={formData.participants.adults}
                  onChange={(e) => handleInputChange('participants', 'adults', e.target.value)}
                  data-testid="participants-adults"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Children</InputLabel>
                <Select
                  value={formData.participants.children}
                  onChange={(e) => handleInputChange('participants', 'children', e.target.value)}
                  data-testid="participants-children"
                >
                  {[0, 1, 2, 3, 4].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Infants</InputLabel>
                <Select
                  value={formData.participants.infants}
                  onChange={(e) => handleInputChange('participants', 'infants', e.target.value)}
                >
                  {[0, 1, 2].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('', 'specialRequests', e.target.value)}
                data-testid="special-requests"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.paymentMethod}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment.method}
                  onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
                  data-testid="payment-method"
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit_card">Debit Card</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="stripe">Stripe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Pricing Summary */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pricing Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Subtotal:</Typography>
                      <Typography data-testid="pricing-subtotal">$0.00</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Taxes:</Typography>
                      <Typography data-testid="pricing-taxes">$0.00</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Fees:</Typography>
                      <Typography>$5.00</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" data-testid="pricing-total">$5.00</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box textAlign="center">
            <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your booking has been successfully created.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Test Status Indicator */}
      <TestStatusIndicator
        testName="Booking Form Test"
        status={testStatus}
        message={
          testStatus === 'running' ? 'Testing booking API...' :
          testStatus === 'success' ? 'Booking API is working correctly' :
          testStatus === 'error' ? 'Booking API test failed' :
          'Ready to test booking functionality'
        }
        error={apiError}
        onStart={testBookingAPI}
        onRetry={handleRetry}
        showControls={true}
      />

      {/* API Error Display */}
      {apiError && (
        <Box mb={3}>
          <ErrorDisplay
            error={apiError}
            title="Booking API Error"
            severity="error"
            onRetry={handleRetry}
            showDetails={true}
          />
        </Box>
      )}

      {/* Main Booking Form */}
      <Card>
        <CardHeader 
          title="Create Booking"
          subheader="Fill out the form to create a new booking"
        />
        <CardContent>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel icon={step.icon}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Box display="flex" gap={2}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : activeStep === steps.length - 2 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  data-testid="submit-booking-btn"
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating Booking...' : 'Create Booking'}
                </Button>
              ) : null}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingFormWithTestHandling;