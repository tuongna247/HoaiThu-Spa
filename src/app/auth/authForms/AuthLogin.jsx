'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from "next/link";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import AuthSocialButtons from "./AuthSocialButtons";
import { useAuth } from "@/contexts/AuthContext";

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!username.trim() || !password.trim()) {
      return;
    }

    const result = await login(username, password);
    
    if (result.success) {
      // Redirect to dashboard after successful login
      router.push('/');
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <AuthSocialButtons title="Sign in with" />
      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            or sign in with
          </Typography>
        </Divider>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username">Username or Email</CustomFormLabel>
            <CustomTextField 
              id="username" 
              variant="outlined" 
              fullWidth 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <CustomCheckbox 
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Remember this Device"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              Forgot Password ?
            </Typography>
          </Stack>
          <Box>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </Stack>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
