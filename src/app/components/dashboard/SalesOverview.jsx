'use client';
import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '@/app/components/shared/DashboardCard';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });


const SalesOverview = () => {
    // select
    const [month, setMonth] = useState('1');
    const [bookingData, setBookingData] = useState({
        categories: [],
        earnings: [],
        bookings: []
    });
    const [loading, setLoading] = useState(true);

    const handleChange = (event) => {
        setMonth(event.target.value);
    };

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const response = await fetch('/api/bookings?limit=100');
                const data = await response.json();
                
                if (data.status === 200) {
                    const bookings = data.data.bookings;
                    
                    // Process data for last 7 days
                    const last7Days = [];
                    const earnings = [];
                    const bookingCounts = [];
                    
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
                        last7Days.push(dateStr);
                        
                        // Filter bookings for this day
                        const dayBookings = bookings.filter(booking => {
                            const bookingDate = new Date(booking.createdAt);
                            return bookingDate.toDateString() === date.toDateString() && 
                                   (booking.status === 'confirmed' || booking.payment.status === 'completed');
                        });
                        
                        const dayEarnings = dayBookings.reduce((total, booking) => total + booking.pricing.total, 0);
                        earnings.push(dayEarnings);
                        bookingCounts.push(dayBookings.length);
                    }
                    
                    setBookingData({
                        categories: last7Days,
                        earnings: earnings,
                        bookings: bookingCounts
                    });
                }
            } catch (error) {
                console.error('Error fetching booking data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [month]);

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // chart
    const optionscolumnchart = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [primary, secondary],
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: '60%',
                columnWidth: '42%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },
        stroke: {
            show: true,
            width: 5,
            lineCap: "butt",
            colors: ["transparent"],
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        yaxis: {
            tickAmount: 4,
            labels: {
                formatter: function (val) {
                    return '$' + val.toFixed(0);
                }
            }
        },
        xaxis: {
            categories: bookingData.categories,
            axisBorder: {
                show: false,
            },
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
            y: {
                formatter: function (val) {
                    return '$' + val.toFixed(2);
                }
            }
        },
    };
    
    const seriescolumnchart = [
        {
            name: 'Earnings from Bookings',
            data: bookingData.earnings,
        },
        {
            name: 'Number of Bookings',
            data: bookingData.bookings.map(count => count * 100), // Scale for visibility
        },
    ];

    return (

        <DashboardCard title="Booking Revenue Overview" action={
            <Select
                labelId="month-dd"
                id="month-dd"
                value={month}
                size="small"
                onChange={handleChange}
            >
                <MenuItem value={1}>Last 7 Days</MenuItem>
                <MenuItem value={2}>Last 30 Days</MenuItem>
                <MenuItem value={3}>Last 90 Days</MenuItem>
            </Select>
        }>
            {loading ? (
                <div style={{ height: 370, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading...
                </div>
            ) : (
                <Chart
                    options={optionscolumnchart}
                    series={seriescolumnchart}
                    type="bar"
                    height={370}
                    width={"100%"}
                />
            )}
        </DashboardCard>
    );
};

export default SalesOverview;
