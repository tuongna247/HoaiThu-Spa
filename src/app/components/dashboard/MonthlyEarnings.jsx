
'use client';
import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconArrowDownRight, IconArrowUpLeft, IconCurrencyDollar } from '@tabler/icons-react';
import DashboardCard from '@/app/components/shared/DashboardCard';

const MonthlyEarnings = () => {
  const [monthlyData, setMonthlyData] = useState({
    currentMonth: 0,
    previousMonth: 0,
    growth: 0,
    isPositive: true,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch('/api/bookings?limit=1000');
        const data = await response.json();
        
        if (data.status === 200) {
          const bookings = data.data.bookings;
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          
          // Calculate revenue for current and previous month
          const currentMonthRevenue = bookings
            .filter(booking => {
              const bookingDate = new Date(booking.createdAt);
              return bookingDate.getMonth() === currentMonth && 
                     bookingDate.getFullYear() === currentYear &&
                     (booking.status === 'confirmed' || booking.payment.status === 'completed');
            })
            .reduce((total, booking) => total + booking.pricing.total, 0);
            
          const previousMonthRevenue = bookings
            .filter(booking => {
              const bookingDate = new Date(booking.createdAt);
              return bookingDate.getMonth() === previousMonth && 
                     bookingDate.getFullYear() === previousYear &&
                     (booking.status === 'confirmed' || booking.payment.status === 'completed');
            })
            .reduce((total, booking) => total + booking.pricing.total, 0);
          
          // Calculate growth percentage
          let growth = 0;
          if (previousMonthRevenue > 0) {
            growth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
          } else if (currentMonthRevenue > 0) {
            growth = 100;
          }
          
          // Generate chart data for last 7 days of current month
          const chartData = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayRevenue = bookings
              .filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate.toDateString() === date.toDateString() &&
                       (booking.status === 'confirmed' || booking.payment.status === 'completed');
              })
              .reduce((total, booking) => total + booking.pricing.total, 0);
              
            chartData.push(dayRevenue / 100); // Scale down for better visualization
          }
          
          setMonthlyData({
            currentMonth: currentMonthRevenue,
            previousMonth: previousMonthRevenue,
            growth: Math.abs(growth),
            isPositive: growth >= 0,
            chartData: chartData
          });
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';
  const successlight = theme.palette.success.light;

  // chart
  const optionscolumnchart = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: function (val) {
          return '$' + (val * 100).toFixed(0);
        }
      }
    },
  };
  
  const seriescolumnchart = [
    {
      name: '',
      color: secondary,
      data: monthlyData.chartData.length > 0 ? monthlyData.chartData : [25, 66, 20, 40, 12, 58, 20],
    },
  ];

  if (loading) {
    return (
      <DashboardCard title="Monthly Earnings">
        <Typography>Loading...</Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Monthly Earnings"
      action={
        <Fab color="secondary" size="medium" sx={{color: '#ffffff'}}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height={60}
        width={"100%"} />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          ${monthlyData.currentMonth.toLocaleString()}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: monthlyData.isPositive ? successlight : errorlight, width: 27, height: 27 }}>
            {monthlyData.isPositive ? (
              <IconArrowUpLeft width={20} color="#39B69A" />
            ) : (
              <IconArrowDownRight width={20} color="#FA896B" />
            )}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {monthlyData.isPositive ? '+' : '-'}{monthlyData.growth.toFixed(1)}%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            last month
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
