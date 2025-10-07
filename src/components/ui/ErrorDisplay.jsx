import React from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Typography,
  Stack
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

const ErrorDisplay = ({ 
  error, 
  title = "Test Error",
  severity = "error",
  showDetails = true,
  onRetry = null,
  onDismiss = null,
  collapsible = true
}) => {
  const [expanded, setExpanded] = React.useState(!collapsible);

  const getErrorIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getErrorColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'error';
    }
  };

  const formatError = (err) => {
    if (typeof err === 'string') {
      return err;
    }
    
    if (err?.message) {
      return err.message;
    }
    
    if (err?.errors && Array.isArray(err.errors)) {
      return err.errors.map(e => e.message || e).join(', ');
    }
    
    return JSON.stringify(err, null, 2);
  };

  const copyErrorToClipboard = () => {
    const errorText = formatError(error);
    navigator.clipboard.writeText(errorText);
  };

  const getErrorSummary = () => {
    if (typeof error === 'string') {
      return error.length > 100 ? error.substring(0, 100) + '...' : error;
    }
    
    if (error?.message) {
      return error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message;
    }
    
    return 'An unexpected error occurred';
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        border: `2px solid`,
        borderColor: `${getErrorColor()}.main`,
        backgroundColor: `${getErrorColor()}.light`,
        opacity: 0.95
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Error Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              {getErrorIcon()}
              <Typography variant="h6" color={`${getErrorColor()}.main`}>
                {title}
              </Typography>
              <Chip
                size="small"
                label={severity.toUpperCase()}
                color={getErrorColor()}
                variant="outlined"
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              {onRetry && (
                <IconButton
                  size="small"
                  onClick={onRetry}
                  title="Retry Test"
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              )}
              
              <IconButton
                size="small"
                onClick={copyErrorToClipboard}
                title="Copy Error"
              >
                <CopyIcon />
              </IconButton>
              
              {collapsible && (
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  title={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Error Summary */}
          <Typography variant="body1" color="text.primary">
            {getErrorSummary()}
          </Typography>

          {/* Detailed Error Information */}
          {showDetails && (
            <Collapse in={expanded}>
              <Box>
                <Divider sx={{ my: 2 }} />
                
                {/* Error Details */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.50',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {formatError(error)}
                  </pre>
                </Paper>

                {/* Error Metadata */}
                {error?.status && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      <BugIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Error Details:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`Status: ${error.status}`}
                        variant="outlined"
                      />
                      {error.code && (
                        <Chip
                          size="small"
                          label={`Code: ${error.code}`}
                          variant="outlined"
                        />
                      )}
                      {error.timestamp && (
                        <Chip
                          size="small"
                          label={`Time: ${new Date(error.timestamp).toLocaleTimeString()}`}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Validation Errors */}
                {error?.errors && Array.isArray(error.errors) && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Validation Errors:
                    </Typography>
                    <Stack spacing={1}>
                      {error.errors.map((err, index) => (
                        <Alert key={index} severity="error" variant="outlined">
                          <AlertDescription>
                            {typeof err === 'object' ? (
                              <>
                                <strong>{err.field}:</strong> {err.message}
                              </>
                            ) : (
                              err
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box mt={3} display="flex" gap={2}>
                  {onRetry && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RefreshIcon />}
                      onClick={onRetry}
                      size="small"
                    >
                      Retry Test
                    </Button>
                  )}
                  
                  {onDismiss && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={onDismiss}
                      size="small"
                    >
                      Dismiss
                    </Button>
                  )}
                </Box>
              </Box>
            </Collapse>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;