'use client'

import { useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Card, CardContent, Alert } from '@mui/material'
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access was denied. You may have canceled the authentication or do not have permission.'
      case 'Verification':
        return 'The verification link is invalid or has expired.'
      case 'Default':
        return 'An unexpected error occurred during authentication.'
      default:
        return 'An authentication error occurred.'
    }
  }

  const getErrorDetails = (error) => {
    switch (error) {
      case 'Configuration':
        return 'Please contact the administrator or try again later.'
      case 'AccessDenied':
        return 'Please try signing in again and make sure to authorize the application.'
      case 'Verification':
        return 'Please request a new verification link.'
      default:
        return 'Please try again or contact support if the problem persists.'
    }
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 2
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom color="error">
              Authentication Error
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body1" gutterBottom>
                <strong>{getErrorMessage(error)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getErrorDetails(error)}
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Error code: {error}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                component={Link}
                href="/auth/auth1/login"
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/"
              >
                Go Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // Default error page
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <Typography align="center" variant="h1" mb={4}>
          Oops!
        </Typography>
        <Typography align="center" variant="h4" mb={4}>
          Something went wrong with authentication.
        </Typography>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          href="/auth/auth1/login"
          disableElevation
        >
          Go Back to Sign In
        </Button>
      </Container>
    </Box>
  )
}