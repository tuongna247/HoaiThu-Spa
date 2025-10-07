'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Divider
} from '@mui/material'
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import RoleBasedAccess from '@/components/auth/RoleBasedAccess'
import { hasPermission, PERMISSIONS } from '@/lib/roles'

export default function SupplierManagementPage() {
  const { user, authenticatedFetch } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await authenticatedFetch('/api/admin/suppliers')
      const data = await response.json()
      
      if (data.status === 200) {
        setSuppliers(data.data)
      } else {
        setError(data.msg || 'Failed to fetch suppliers')
      }
    } catch (err) {
      setError('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission(user, PERMISSIONS.APPROVE_SUPPLIERS)) {
      fetchSuppliers()
    }
  }, [user])

  const handleViewSupplier = async (supplierId) => {
    try {
      const response = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/approve`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedSupplier(data.data.supplier)
        setOpenDialog(true)
      }
    } catch (err) {
      setError('Failed to load supplier details')
    }
  }

  const handleApproveSupplier = async (supplierId, approved = true) => {
    try {
      setActionLoading(true)
      const response = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      })

      const data = await response.json()
      
      if (data.success) {
        setError('')
        fetchSuppliers() // Refresh list
        setOpenDialog(false)
      } else {
        setError(data.message || 'Failed to update supplier status')
      }
    } catch (err) {
      setError('Failed to update supplier status')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending_approval': return 'warning'
      case 'suspended': return 'error'
      case 'inactive': return 'default'
      default: return 'default'
    }
  }

  const getKycColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'submitted': return 'info'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <RoleBasedAccess allowedRoles={['admin', 'country_admin']}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Supplier Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>KYC Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No suppliers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {supplier.company_info?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {supplier.company_info?.contact?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {supplier.owner?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {supplier.owner?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={supplier.status?.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(supplier.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={supplier.KYC_status?.toUpperCase()}
                            color={getKycColor(supplier.KYC_status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(supplier.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewSupplier(supplier._id)}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          {supplier.status === 'pending_approval' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveSupplier(supplier._id, true)}
                                title="Approve"
                              >
                                <ApproveIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleApproveSupplier(supplier._id, false)}
                                title="Reject"
                              >
                                <RejectIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Supplier Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BusinessIcon />
              Supplier Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedSupplier && (
              <Box>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="Company Info" />
                  <Tab label="Owner Details" />
                  <Tab label="Bank Info" />
                  <Tab label="KYC Documents" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        {selectedSupplier.company?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip 
                        label={selectedSupplier.status?.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedSupplier.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Commission Rate</Typography>
                      <Typography variant="body2">
                        {(selectedSupplier.commission_rate * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Description</Typography>
                      <Typography variant="body2">
                        {selectedSupplier.company?.description || 'No description provided'}
                      </Typography>
                    </Grid>
                    {selectedSupplier.company?.website && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Website</Typography>
                        <Typography variant="body2">
                          {selectedSupplier.company.website}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Name</Typography>
                      <Typography variant="body2">{selectedSupplier.owner?.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body2">{selectedSupplier.owner?.email}</Typography>
                    </Grid>
                    {selectedSupplier.owner?.phone && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Phone</Typography>
                        <Typography variant="body2">{selectedSupplier.owner.phone}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Member Since</Typography>
                      <Typography variant="body2">
                        {new Date(selectedSupplier.owner?.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={2}>
                    {selectedSupplier.bank_info?.account_name && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Account Name</Typography>
                        <Typography variant="body2">{selectedSupplier.bank_info.account_name}</Typography>
                      </Grid>
                    )}
                    {selectedSupplier.bank_info?.bank_name && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Bank Name</Typography>
                        <Typography variant="body2">{selectedSupplier.bank_info.bank_name}</Typography>
                      </Grid>
                    )}
                    {selectedSupplier.bank_info?.account_number && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Account Number</Typography>
                        <Typography variant="body2">{selectedSupplier.bank_info.account_number}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      KYC Status: <Chip 
                        label={selectedSupplier.kyc_status?.toUpperCase()}
                        color={getKycColor(selectedSupplier.kyc_status)}
                        size="small"
                      />
                    </Typography>
                    {selectedSupplier.kyc_documents?.length > 0 ? (
                      selectedSupplier.kyc_documents.map((doc, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {doc.type?.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </Typography>
                          <Chip 
                            label={doc.status?.toUpperCase()}
                            color={getKycColor(doc.status)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No KYC documents uploaded
                      </Typography>
                    )}
                  </Box>
                </TabPanel>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            {selectedSupplier?.status === 'pending_approval' && (
              <>
                <Button
                  color="error"
                  onClick={() => handleApproveSupplier(selectedSupplier.id, false)}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => handleApproveSupplier(selectedSupplier.id, true)}
                  disabled={actionLoading}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </RoleBasedAccess>
  )
}