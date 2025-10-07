'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function OAuthRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.replace('/auth/auth1/login')
      return
    }

    if (session?.user) {
      // Redirect based on user role
      if (session.user.role === 'customer') {
        router.replace('/tours')
      } else {
        router.replace('/dashboard-main')
      }
    }
  }, [session, status, router])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
      <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
        Redirecting...
      </Typography>
      <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
        Taking you to the right place based on your account type
      </Typography>
    </Box>
  )
}