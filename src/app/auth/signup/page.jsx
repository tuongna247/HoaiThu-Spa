'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Google as GoogleIcon, Facebook as FacebookIcon } from '@mui/icons-material'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed')
      }

      setSuccess('Account created successfully! Redirecting to sign in...')
      
      // Auto sign in after successful registration
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard-main')
        } else {
          router.push('/auth/auth1/login')
        }
      }, 2000)

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider) => {
    setLoading(true)
    setError('')

    try {
      await signIn(provider, { 
        callbackUrl: '/dashboard-main',
        redirect: true 
      })
    } catch (err) {
      setError(`${provider} sign in failed. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

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
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Join our tour platform today
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* OAuth Buttons */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Sign up with Google
            </Button>
            {/* Facebook temporarily disabled
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Sign up with Facebook
            </Button>
            */}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSignUp}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Account Type"
                onChange={handleInputChange}
              >
                <MenuItem value="customer">Customer (Book Tours)</MenuItem>
                <MenuItem value="mod">Tour Guide (Create Tours)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link href="/auth/auth1/login" underline="hover">
              Sign in here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}