
'use client';
import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconArrowUpLeft, IconArrowDownRight } from '@tabler/icons-react';

import DashboardCard from '@/app/components/shared/DashboardCard';

const YearlyBreakup = () => {
  const [yearlyData, setYearlyData] = useState({
    currentYear: 0,
    previousYear: 0,
    growth: 0,
    isPositive: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYearlyData = async () => {
      try {
        const response = await fetch('/api/bookings?limit=1000');
        const data = await response.json();
        
        if (data.status === 200) {
          const bookings = data.data.bookings;
          const currentYear = new Date().getFullYear();
          const previousYear = currentYear - 1;
          
          // Calculate revenue for current and previous year
          const currentYearRevenue = bookings
            .filter(booking => {
              const bookingYear = new Date(booking.createdAt).getFullYear();
              return bookingYear === currentYear && 
                     (booking.status === 'confirmed' || booking.payment.status === 'completed');
            })
            .reduce((total, booking) => total + booking.pricing.total, 0);
            
          const previousYearRevenue = bookings
            .filter(booking => {
              const bookingYear = new Date(booking.createdAt).getFullYear();
              return bookingYear === previousYear && 
                     (booking.status === 'confirmed' || booking.payment.status === 'completed');
            })
            .reduce((total, booking) => total + booking.pricing.total, 0);
          
          // Calculate growth percentage
          let growth = 0;
          if (previousYearRevenue > 0) {
            growth = ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100;
          } else if (currentYearRevenue > 0) {
            growth = 100; // 100% growth if no previous year data
          }
          
          setYearlyData({
            currentYear: currentYearRevenue,
            previousYear: previousYearRevenue,
            growth: Math.abs(growth),
            isPositive: growth >= 0
          });
        }
      } catch (error) {
        console.error('Error fetching yearly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyData();
  }, []);

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#ecf2ff';
  const successlight = theme.palette.success.light;
  const errorlight = '#fdede8';

  // chart
  const optionscolumnchart = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: [primary, primarylight, '#F9F9FD'],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
      y: {
        formatter: function (val) {
          return '$' + val.toFixed(0);
        }
      }
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };
  
  const seriescolumnchart = [yearlyData.currentYear, yearlyData.previousYear, Math.max(yearlyData.currentYear, yearlyData.previousYear) * 0.1];

  if (loading) {
    return (
      <DashboardCard title="Yearly Revenue">
        <Typography>Loading...</Typography>
      </DashboardCard>
    );
  }

  return (
    (<DashboardCard title="Yearly Revenue">
      <Grid container spacing={3}>
        {/* column */}
        <Grid
          size={{
            xs: 7,
            sm: 7
          }}>
          <Typography variant="h3" fontWeight="700">
            ${yearlyData.currentYear.toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: yearlyData.isPositive ? successlight : errorlight, width: 27, height: 27 }}>
              {yearlyData.isPositive ? (
                <IconArrowUpLeft width={20} color="#39B69A" />
              ) : (
                <IconArrowDownRight width={20} color="#FA896B" />
              )}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {yearlyData.isPositive ? '+' : '-'}{yearlyData.growth.toFixed(1)}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              last year
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {new Date().getFullYear()}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                {new Date().getFullYear() - 1}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* column */}
        <Grid
          size={{
            xs: 5,
            sm: 5
          }}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="donut"
            height={150}
            width={"100%"}
          />
        </Grid>
      </Grid>
    </DashboardCard>)
  );
};

export default YearlyBreakup;
