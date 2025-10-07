import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Stack,
  Portal
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      message: '',
      title: '',
      duration: 5000,
      persistent: false,
      showProgress: false,
      actions: [],
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const removeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      title: 'Success',
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      title: 'Error',
      duration: 8000,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      title: 'Warning',
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      title: 'Info',
      ...options
    });
  }, [addNotification]);

  const showTestError = useCallback((error, options = {}) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Test failed';
    const errorDetails = error?.details || error?.stack || '';
    
    return addNotification({
      type: 'error',
      title: 'Test Failed',
      message: errorMessage,
      details: errorDetails,
      persistent: true,
      actions: [
        ...(options.onRetry ? [{
          label: 'Retry',
          action: options.onRetry,
          variant: 'contained',
          color: 'primary'
        }] : []),
        ...(options.onViewDetails ? [{
          label: 'View Details',
          action: options.onViewDetails,
          variant: 'outlined'
        }] : [])
      ],
      ...options
    });
  }, [addNotification]);

  const showTestSuccess = useCallback((message = 'All tests passed', options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Tests Passed',
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTestError,
    showTestSuccess
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          maxWidth: '400px',
          width: '100%'
        }}
      >
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={onRemove}
            />
          ))}
        </Stack>
      </Box>
    </Portal>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const {
    id,
    type,
    title,
    message,
    details,
    actions,
    persistent,
    showProgress,
    duration
  } = notification;

  const [progress, setProgress] = useState(100);
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    if (!persistent && duration > 0 && showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [persistent, duration, showProgress]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  const getSeverity = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <Alert
      severity={getSeverity()}
      variant="filled"
      icon={getIcon()}
      sx={{
        minWidth: '300px',
        position: 'relative',
        overflow: 'hidden'
      }}
      action={
        <IconButton
          size="small"
          color="inherit"
          onClick={() => onRemove(id)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      {showProgress && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${progress}%`,
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            transition: 'width 0.1s linear'
          }}
        />
      )}
      
      <AlertTitle>{title}</AlertTitle>
      
      <Box sx={{ mb: details || actions?.length ? 1 : 0 }}>
        {message}
      </Box>

      {details && (
        <Box>
          <Box
            component="span"
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem',
              opacity: 0.9
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide details' : 'Show details'}
          </Box>
          
          {expanded && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                maxHeight: '150px',
                overflow: 'auto'
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {details}
              </pre>
            </Box>
          )}
        </Box>
      )}

      {actions?.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {actions.map((action, index) => (
            <Box
              key={index}
              component="button"
              onClick={() => {
                action.action();
                if (action.closeOnAction !== false) {
                  onRemove(id);
                }
              }}
              sx={{
                px: 2,
                py: 0.5,
                border: action.variant === 'outlined' ? '1px solid currentColor' : 'none',
                backgroundColor: action.variant === 'contained' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: 'inherit',
                borderRadius: 1,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {action.label}
            </Box>
          ))}
        </Stack>
      )}
    </Alert>
  );
};

export default NotificationProvider;