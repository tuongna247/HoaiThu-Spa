
'use client';
import { useState, useEffect } from 'react';
import DashboardCard from '@/app/components/shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Link, Typography } from '@mui/material';

const RecentTransactions = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await fetch('/api/bookings?limit=6');
        const data = await response.json();
        if (data.status === 200) {
          setBookings(data.data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, []);

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'completed' && status === 'confirmed') return 'success';
    if (paymentStatus === 'failed' || status === 'cancelled') return 'error';
    if (paymentStatus === 'processing') return 'warning';
    return 'primary';
  };

  const getStatusText = (booking) => {
    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    
    if (booking.payment.status === 'completed' && booking.status === 'confirmed') {
      return `Booking confirmed for ${customerName} - ${booking.tour.title} ($${booking.pricing.total})`;
    }
    if (booking.payment.status === 'failed') {
      return `Payment failed for ${customerName} - ${booking.tour.title}`;
    }
    if (booking.status === 'cancelled') {
      return `Booking cancelled by ${customerName} - ${booking.tour.title}`;
    }
    if (booking.payment.status === 'processing') {
      return `Processing payment for ${customerName} - ${booking.tour.title}`;
    }
    return `New booking from ${customerName} - ${booking.tour.title} ($${booking.pricing.total})`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardCard title="Recent Bookings">
        <Typography>Loading...</Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Recent Bookings">
      <>
        <Timeline
          className="theme-timeline"
          nonce={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
          sx={{
            p: 0,
            mb: '-40px',
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: '#efefef'
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
              paddingLeft: 0,
            },
          }}
        >
          {bookings.map((booking, index) => (
            <TimelineItem key={booking._id}>
              <TimelineOppositeContent>
                {formatTime(booking.createdAt)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot 
                  color={getStatusColor(booking.status, booking.payment.status)} 
                  variant="outlined" 
                />
                {index < bookings.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                {getStatusText(booking)}
                {booking.bookingReference && (
                  <>
                    {' '}
                    <Link 
                      href={`/admin/bookings?search=${booking.bookingReference}`} 
                      underline="none"
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                    >
                      #{booking.bookingReference}
                    </Link>
                  </>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </>
    </DashboardCard>
  );
};

export default RecentTransactions;
