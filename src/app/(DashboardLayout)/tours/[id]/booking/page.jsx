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
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as PayPalIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
// Date picker imports removed - using native HTML date input instead
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb';
import PageContainer from '@/app/components/container/PageContainer';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

const steps = ['Tour Details', 'Participants', 'Payment', 'Confirmation'];

// Helper function to get next available date based on tour's available days
const getNextAvailableDate = (availableDays) => {
  if (!availableDays || availableDays.length === 0) {
    // If no available days specified, default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  
  // Find the next available date
  for (let i = 1; i <= 14; i++) { // Check next 14 days
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dayName = dayNames[checkDate.getDay()];
    
    if (availableDays.includes(dayName)) {
      return checkDate;
    }
  }
  
  // Fallback to tomorrow if no available day found
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

// Helper function to check if a date is available
const isDateAvailable = (date, availableDays) => {
  if (!availableDays || availableDays.length === 0) return true;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[date.getDay()];
  return availableDays.includes(dayName);
};

const BookingPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [completedBooking, setCompletedBooking] = useState(null);

  const [bookingData, setBookingData] = useState({
    tour: {
      tourId: id,
      date: null, // Will be set after tour data is loaded
      timeSlot: '' // Will be set from tour's available time slots
    },
    participants: {
      adults: 1,
      children: 0,
      infants: 0
    },
    customer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      specialRequests: ''
    },
    payment: {
      method: 'credit_card'
    },
    paymentDetails: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }
  });

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
        
        // Set default date and time based on tour schedule
        const defaultDate = getNextAvailableDate(data.data.schedule?.availableDays);
        const defaultTimeSlot = data.data.schedule?.timeSlots?.[0] || '09:00 AM';
        
        setBookingData(prev => ({
          ...prev,
          tour: {
            ...prev.tour,
            tourId: data.data._id,
            date: defaultDate,
            timeSlot: defaultTimeSlot
          }
        }));
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

  const calculatePricing = () => {
    if (!tour) return { total: 0, subtotal: 0, taxes: 0, fees: 0 };

    const adultPrice = tour.price;
    const childPrice = tour.price * 0.7; // 30% discount
    const infantPrice = 0;

    const subtotal = 
      (bookingData.participants.adults * adultPrice) +
      (bookingData.participants.children * childPrice) +
      (bookingData.participants.infants * infantPrice);
    
    const taxes = subtotal * 0.1; // 10% tax
    const fees = 5; // $5 booking fee
    const total = subtotal + taxes + fees;

    return { subtotal, taxes, fees, total, adultPrice, childPrice, infantPrice };
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      // Process payment
      await processBooking();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const processBooking = async () => {
    setProcessing(true);
    try {
      // Create booking
      // Map the booking data to match the API expectations
      const apiBookingData = {
        tour: {
          tourId: bookingData.tour.tourId,
          title: tour.title,
          price: tour.price,
          selectedDate: bookingData.tour.date ? bookingData.tour.date.toISOString().split('T')[0] : null,
          selectedTimeSlot: bookingData.tour.timeSlot || '09:00 AM'
        },
        customer: {
          firstName: bookingData.customer.firstName,
          lastName: bookingData.customer.lastName,
          email: bookingData.customer.email,
          phone: bookingData.customer.phone
        },
        participants: {
          adults: bookingData.participants.adults,
          children: bookingData.participants.children,
          infants: bookingData.participants.infants
        },
        specialRequests: bookingData.customer.specialRequests || ''
      };

      console.log('Sending booking data to API:', apiBookingData);

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBookingData)
      });

      const bookingResult = await bookingResponse.json();
      if (bookingResult.status !== 201) {
        throw new Error(bookingResult.msg);
      }

      // Process payment
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingResult.data._id,
          paymentMethod: {
            type: bookingData.payment.method,
            provider: 'stripe',
            ...bookingData.paymentDetails
          },
          billingAddress: bookingData.paymentDetails.billingAddress
        })
      });

      const paymentResult = await paymentResponse.json();
      
      if (paymentResult.status === 201) {
        setCompletedBooking({
          booking: bookingResult.data,
          payment: paymentResult.data
        });
        setActiveStep(steps.length - 1);
      } else {
        throw new Error(paymentResult.msg || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Booking error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const updateParticipantCount = (type, increment) => {
    setBookingData(prev => ({
      ...prev,
      participants: {
        ...prev.participants,
        [type]: Math.max(0, prev.participants[type] + (increment ? 1 : -1))
      }
    }));
  };

  const pricing = calculatePricing();

  if (loading) {
    return (
      <PageContainer title="Booking" description="Complete your tour booking">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error && !tour) {
    return (
      <PageContainer title="Booking Error" description="Booking error">
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/tours', title: 'Tours' },
    { to: `/tours/${id}`, title: tour?.title },
    { title: 'Booking' },
  ];

  return (
    <RoleBasedAccess allowedRoles={['admin', 'mod', 'customer']}>
      <PageContainer title={`Book ${tour?.title}`} description="Complete your tour booking">
        <Breadcrumb title="Booking" items={BCrumb} />
        
        <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Step 0: Tour Details */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Select Tour Date & Time
                    </Typography>
                    {tour?.schedule?.meetingPoint && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>Meeting Point:</strong> {tour.schedule.meetingPoint}<br/>
                        <strong>Duration:</strong> {tour.schedule.startTime} - {tour.schedule.endTime}
                      </Alert>
                    )}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Tour Date"
                          type="date"
                          value={bookingData.tour.date ? bookingData.tour.date.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            if (isDateAvailable(selectedDate, tour?.schedule?.availableDays)) {
                              setBookingData(prev => ({
                                ...prev,
                                tour: { ...prev.tour, date: selectedDate }
                              }));
                            }
                          }}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: new Date().toISOString().split('T')[0] }}
                          helperText={
                            tour?.schedule?.availableDays?.length > 0 
                              ? `Available on: ${tour.schedule.availableDays.join(', ')}`
                              : "Select your preferred date"
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel>Time Slot</InputLabel>
                          <Select
                            value={bookingData.tour.timeSlot}
                            label="Time Slot"
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              tour: { ...prev.tour, timeSlot: e.target.value }
                            }))}
                          >
                            {tour?.schedule?.timeSlots?.length > 0 ? (
                              tour.schedule.timeSlots.map((slot) => (
                                <MenuItem key={slot} value={slot}>
                                  {slot}
                                </MenuItem>
                              ))
                            ) : (
                              [
                                <MenuItem key="09:00" value="09:00 AM">09:00 AM</MenuItem>,
                                <MenuItem key="14:00" value="02:00 PM">02:00 PM</MenuItem>
                              ]
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 1: Participants */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Participants & Customer Details
                    </Typography>
                    
                    {/* Participant Count */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Number of Participants
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="body1">Adults</Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${pricing.adultPrice} per person
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              onClick={() => updateParticipantCount('adults', false)}
                              disabled={bookingData.participants.adults <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                              {bookingData.participants.adults}
                            </Typography>
                            <IconButton onClick={() => updateParticipantCount('adults', true)}>
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="body1">Children (3-12 years)</Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${pricing.childPrice} per child
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              onClick={() => updateParticipantCount('children', false)}
                              disabled={bookingData.participants.children <= 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                              {bookingData.participants.children}
                            </Typography>
                            <IconButton onClick={() => updateParticipantCount('children', true)}>
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1">Infants (0-2 years)</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Free
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              onClick={() => updateParticipantCount('infants', false)}
                              disabled={bookingData.participants.infants <= 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                              {bookingData.participants.infants}
                            </Typography>
                            <IconButton onClick={() => updateParticipantCount('infants', true)}>
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Customer Details */}
                    <Typography variant="subtitle1" gutterBottom>
                      Customer Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="First Name"
                          required
                          value={bookingData.customer.firstName}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            customer: { ...prev.customer, firstName: e.target.value }
                          }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          required
                          value={bookingData.customer.lastName}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            customer: { ...prev.customer, lastName: e.target.value }
                          }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          required
                          value={bookingData.customer.email}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            customer: { ...prev.customer, email: e.target.value }
                          }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          required
                          value={bookingData.customer.phone}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            customer: { ...prev.customer, phone: e.target.value }
                          }))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Special Requests (Optional)"
                          multiline
                          rows={3}
                          value={bookingData.customer.specialRequests}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            customer: { ...prev.customer, specialRequests: e.target.value }
                          }))}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 2: Payment */}
                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Payment Information
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                      <FormLabel component="legend">Payment Method</FormLabel>
                      <RadioGroup
                        value={bookingData.payment.method}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          payment: { ...prev.payment, method: e.target.value }
                        }))}
                      >
                        <FormControlLabel 
                          value="credit_card" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CreditCardIcon sx={{ mr: 1 }} />
                              Credit/Debit Card
                            </Box>
                          }
                        />
                        <FormControlLabel 
                          value="paypal" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PayPalIcon sx={{ mr: 1 }} />
                              PayPal
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>

                    {bookingData.payment.method === 'credit_card' && (
                      <Box>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Cardholder Name"
                              required
                              value={bookingData.paymentDetails.cardholderName}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                paymentDetails: { ...prev.paymentDetails, cardholderName: e.target.value }
                              }))}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Card Number"
                              required
                              placeholder="1234 5678 9012 3456"
                              value={bookingData.paymentDetails.cardNumber}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                paymentDetails: { ...prev.paymentDetails, cardNumber: e.target.value }
                              }))}
                            />
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <TextField
                              fullWidth
                              label="Month"
                              required
                              placeholder="MM"
                              value={bookingData.paymentDetails.expiryMonth}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                paymentDetails: { ...prev.paymentDetails, expiryMonth: e.target.value }
                              }))}
                            />
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <TextField
                              fullWidth
                              label="Year"
                              required
                              placeholder="YY"
                              value={bookingData.paymentDetails.expiryYear}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                paymentDetails: { ...prev.paymentDetails, expiryYear: e.target.value }
                              }))}
                            />
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <TextField
                              fullWidth
                              label="CVV"
                              required
                              placeholder="123"
                              value={bookingData.paymentDetails.cvv}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                paymentDetails: { ...prev.paymentDetails, cvv: e.target.value }
                              }))}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Step 3: Confirmation */}
                {activeStep === 3 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                      Booking Confirmed!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Thank you for your booking. Your confirmation details have been sent to your email.
                    </Typography>
                    
                    {completedBooking && (
                      <Paper sx={{ p: 3, mt: 3, textAlign: 'left' }}>
                        <Typography variant="h6" gutterBottom>
                          Booking Details
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Booking ID:</strong> {completedBooking.booking.bookingId}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Tour:</strong> {completedBooking.booking.tour.title}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Date:</strong> {new Date(completedBooking.booking.tour.selectedDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Time:</strong> {completedBooking.booking.tour.selectedTimeSlot}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Total Paid:</strong> ${completedBooking.booking.pricing.total}
                        </Typography>
                      </Paper>
                    )}

                    <Button
                      variant="contained"
                      onClick={() => router.push('/tours')}
                      sx={{ mt: 3 }}
                    >
                      Browse More Tours
                    </Button>
                  </Box>
                )}

                {/* Navigation Buttons */}
                {activeStep < 3 && (
                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={processing || 
                        (activeStep === 0 && (!bookingData.tour.date || !bookingData.tour.timeSlot)) ||
                        (activeStep === 1 && (!bookingData.customer.firstName || !bookingData.customer.lastName || !bookingData.customer.email || !bookingData.customer.phone))
                      }
                    >
                      {processing ? (
                        <CircularProgress size={24} />
                      ) : (
                        activeStep === steps.length - 2 ? 'Complete Booking' : 'Next'
                      )}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Summary Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                
                {tour && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {tour.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {tour.location.city}, {tour.location.country}
                    </Typography>
                    {bookingData.tour.date && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Date:</strong> {bookingData.tour.date.toLocaleDateString()}
                      </Typography>
                    )}
                    {bookingData.tour.timeSlot && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Time:</strong> {bookingData.tour.timeSlot}
                      </Typography>
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Participants
                  </Typography>
                  {bookingData.participants.adults > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Adults × {bookingData.participants.adults}
                      </Typography>
                      <Typography variant="body2">
                        ${(bookingData.participants.adults * pricing.adultPrice).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {bookingData.participants.children > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Children × {bookingData.participants.children}
                      </Typography>
                      <Typography variant="body2">
                        ${(bookingData.participants.children * pricing.childPrice).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {bookingData.participants.infants > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Infants × {bookingData.participants.infants}
                      </Typography>
                      <Typography variant="body2">
                        $0.00
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">${pricing.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Taxes</Typography>
                    <Typography variant="body2">${pricing.taxes.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Booking Fee</Typography>
                    <Typography variant="body2">${pricing.fees.toFixed(2)}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main">
                    ${pricing.total.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      </PageContainer>
    </RoleBasedAccess>
  );
};

export default BookingPage;