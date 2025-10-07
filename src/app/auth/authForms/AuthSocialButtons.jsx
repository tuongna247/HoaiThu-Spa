'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Alert, CircularProgress } from '@mui/material';
import { useAuth } from "@/contexts/AuthContext";

const AuthSocialButtons = ({ title }) => {
  const [loading, setLoading] = useState({ google: false, facebook: false });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading({ ...loading, google: true });
    setError(null);
    
    try {
      // Create a demo account for Google login
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'google_user',
          email: 'google@demo.com', 
          password: 'demo123',
          role: 'user'
        })
      });

      // Try to login with demo account
      const result = await login('google_user', 'demo123');
      
      if (result.success) {
        router.push('/');
      } else {
        setError('Google login is not configured yet. Please use manual login.');
      }
    } catch (error) {
      setError('Google login is not configured yet. Please use manual login.');
    } finally {
      setLoading({ ...loading, google: false });
    }
  };

  const handleFacebookLogin = async () => {
    setLoading({ ...loading, facebook: true });
    setError(null);
    
    try {
      // Create a demo account for Facebook login  
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'facebook_user',
          email: 'facebook@demo.com',
          password: 'demo123', 
          role: 'user'
        })
      });

      // Try to login with demo account
      const result = await login('facebook_user', 'demo123');
      
      if (result.success) {
        router.push('/');
      } else {
        setError('Facebook login is not configured yet. Please use manual login.');
      }
    } catch (error) {
      setError('Facebook login is not configured yet. Please use manual login.');
    } finally {
      setLoading({ ...loading, facebook: false });
    }
  };

  return (
    <>
      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
        <CustomSocialButton onClick={handleGoogleLogin} disabled={loading.google || loading.facebook}>
          {loading.google ? (
            <CircularProgress size={16} sx={{ mr: 1 }} />
          ) : (
            <Avatar
              src={"/images/svgs/google-icon.svg"}
              alt={"Google"}
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0,
                mr: 1,
              }}
            />
          )}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              whiteSpace: "nowrap",
              mr: { sm: "3px" },
            }}
          >
            {title}{" "}
          </Box>
          Google
        </CustomSocialButton>
        
        <CustomSocialButton onClick={handleFacebookLogin} disabled={loading.google || loading.facebook}>
          {loading.facebook ? (
            <CircularProgress size={16} sx={{ mr: 1 }} />
          ) : (
            <Avatar
              src={"/images/svgs/facebook-icon.svg"}
              alt={"Facebook"}
              sx={{
                width: 25,
                height: 25,
                borderRadius: 0,
                mr: 1,
              }}
            />
          )}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              whiteSpace: "nowrap",
              mr: { sm: "3px" },
            }}
          >
            {title}{" "}
          </Box>
          FB
        </CustomSocialButton>
      </Stack>
    </>
  );
};

export default AuthSocialButtons;
