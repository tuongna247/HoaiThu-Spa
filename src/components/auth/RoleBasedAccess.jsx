'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Button } from '@mui/material';
import { IconLock, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

const RoleBasedAccess = ({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  redirectTo = '/',
  showFallback = true 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        gap={2}
      >
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (!showFallback) return null;
    
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        gap={2}
      >
        <IconLock size={48} color="#f44336" />
        <Typography variant="h5" color="error">
          Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          You need to be logged in to access this content.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          href="/auth/auth1/login"
          startIcon={<IconHome />}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // Check if user has required role
  const userRole = user?.role;
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallbackComponent) {
      return fallbackComponent;
    }

    if (!showFallback) return null;

    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        gap={2}
      >
        <IconLock size={48} color="#f44336" />
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          You don&apos;t have permission to access this content.
          <br />
          Required role(s): {allowedRoles.join(', ')}
          <br />
          Your role: {userRole}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          href={redirectTo}
          startIcon={<IconHome />}
        >
          Go to Home
        </Button>
      </Box>
    );
  }

  // User has access, render children
  return children;
};

// Helper hook for checking roles in components
export const useRoleCheck = () => {
  const { user, isAuthenticated } = useAuth();
  
  const hasRole = (roles) => {
    if (!isAuthenticated || !user?.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isAdmin = () => hasRole('admin');
  const isMod = () => hasRole('mod');
  const isCustomer = () => hasRole('customer');
  const isAdminOrMod = () => hasRole(['admin', 'mod']);

  return {
    hasRole,
    isAdmin,
    isMod,
    isCustomer,
    isAdminOrMod,
    userRole: user?.role
  };
};

export default RoleBasedAccess;