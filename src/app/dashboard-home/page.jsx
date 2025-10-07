'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'

export default function DashboardHomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.replace('/auth/auth1/login')
      return
    }

    if (session?.user) {
      // Redirect to the DashboardLayout main page
      router.replace('/')
    }
  }, [session, status, router])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CircularProgress />
    </Box>
  )
}