
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import { IconEye, IconEdit } from '@tabler/icons-react';
import Link from 'next/link';
import DashboardCard from '@/app/components/shared/DashboardCard';

const ProductPerformance = () => {
    const router = useRouter();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tours?limit=10&sortBy=createdAt&sortOrder=desc');
            const data = await response.json();
            
            if (data.status === 200) {
                setTours(data.data.tours);
            } else {
                setError('Failed to fetch tours');
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
            setError('Error loading tours');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (tour) => {
        if (tour.isFeatured) return 'primary';
        if (tour.isActive) return 'success';
        return 'default';
    };

    const getStatusText = (tour) => {
        if (tour.isFeatured) return 'Featured';
        if (tour.isActive) return 'Active';
        return 'Inactive';
    };

    const formatLocation = (location) => {
        if (location?.city && location?.country) {
            return `${location.city}, ${location.country}`;
        }
        return location?.city || location?.country || 'Location not specified';
    };

    const handleRowClick = (tourId, event) => {
        // Don't navigate if clicking on action buttons
        if (event.target.closest('button') || event.target.closest('a')) {
            return;
        }
        router.push(`/tours/${tourId}`);
    };

    if (loading) {
        return (
            <DashboardCard title="Tour List">
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Loading tours...</Typography>
                </Box>
            </DashboardCard>
        );
    }

    if (error) {
        return (
            <DashboardCard title="Tour List">
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard title="Tour List">
            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Id
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Tour Name
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Location
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Status
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Price
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tours.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="textSecondary">
                                        No tours available
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tours.map((tour) => (
                                <TableRow 
                                    key={tour._id}
                                    hover
                                    onClick={(event) => handleRowClick(tour._id, event)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            #{tour._id.slice(-6)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {tour.title}
                                                </Typography>
                                                <Typography
                                                    color="textSecondary"
                                                    sx={{
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    {tour.duration || 'Duration not specified'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                            {formatLocation(tour.location)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            color={getStatusColor(tour)}
                                            size="small"
                                            label={getStatusText(tour)}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="h6">
                                            ${tour.price ? tour.price.toLocaleString() : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="View Tour">
                                                <IconButton
                                                    size="small"
                                                    component={Link}
                                                    href={`/tours/${tour._id}`}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <IconEye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Tour">
                                                <IconButton
                                                    size="small"
                                                    component={Link}
                                                    href={`/admin/tours/${tour._id}/edit`}
                                                    sx={{ color: 'secondary.main' }}
                                                >
                                                    <IconEdit size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>
        </DashboardCard>
    );
};

export default ProductPerformance;
