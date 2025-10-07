'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/auth1/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (!isAuthenticated) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  // Check admin access if required
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        gap={2}
      >
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

  // User is authenticated, render children
  return children;
};

export default ProtectedRoute;