'use client'
import { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runSetup = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/setup-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.msg || 'Setup failed');
      }
    } catch (error) {
      setError('Failed to run setup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={3}
      p={3}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          🔧 Database Setup
        </Typography>
        
        <Typography variant="body1" paragraph>
          This will create demo user accounts in your MongoDB database for testing the application.
        </Typography>

        <Typography variant="h6" gutterBottom>
          Demo Accounts to Create:
        </Typography>
        <ul>
          <li><strong>admin</strong> - Admin user (admin123)</li>
          <li><strong>user</strong> - Regular user (user123)</li>
          <li><strong>google_user</strong> - Google demo account (demo123)</li>
          <li><strong>facebook_user</strong> - Facebook demo account (demo123)</li>
        </ul>

        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={runSetup}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Setting up...' : 'Run Database Setup'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Box mt={3}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Setup completed successfully!
            </Alert>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Results:
              </Typography>
              {results.map((result, index) => (
                <Typography key={index} variant="body2" component="div">
                  {result}
                </Typography>
              ))}
            </Paper>
          </Box>
        )}

        <Box mt={3}>
          <Typography variant="caption" color="textSecondary">
            You only need to run this once. If accounts already exist, it will skip them.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}