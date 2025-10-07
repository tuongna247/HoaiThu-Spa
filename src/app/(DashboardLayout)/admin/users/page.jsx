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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import RoleBasedAccess from '@/components/auth/RoleBasedAccess'
import { ROLE_DEFINITIONS, getManageableRoles, hasPermission, PERMISSIONS } from '@/lib/roles'

export default function UserManagementPage() {
  const { user, authenticatedFetch } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'customer',
    isActive: true,
    country: '',
    companyName: '',
    department: '',
    managedBy: '',
    permissions: []
  })
  
  const [availableRoles, setAvailableRoles] = useState([])
  const [supervisors, setSupervisors] = useState([])

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await authenticatedFetch('/api/admin/users')
      const data = await response.json()
      
      if (data.status === 200) {
        setUsers(data.data)
      } else {
        setError(data.msg || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Fetch supervisors for supplier assignment
  const fetchSupervisors = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/users?role=supervisor')
      const data = await response.json()
      if (data.status === 200) {
        setSupervisors(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch supervisors:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchSupervisors()
    
    // Set available roles based on current user's permissions
    if (user) {
      const manageable = getManageableRoles(user.role)
      setAvailableRoles(manageable)
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleOpenDialog = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit)
      setFormData({
        name: userToEdit.name,
        username: userToEdit.username,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        isActive: userToEdit.isActive,
        country: userToEdit.country || '',
        companyName: userToEdit.companyName || '',
        department: userToEdit.department || '',
        managedBy: userToEdit.managedBy || '',
        permissions: userToEdit.permissions || []
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'customer',
        isActive: true,
        country: '',
        companyName: '',
        department: '',
        managedBy: '',
        permissions: []
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingUser ? `/api/admin/users/${editingUser._id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'
      
      const payload = { ...formData }
      if (editingUser && !formData.password) {
        delete payload.password // Don't update password if empty
      }

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.status === 200 || data.status === 201) {
        fetchUsers()
        handleCloseDialog()
      } else {
        setError(data.msg || `Failed to ${editingUser ? 'update' : 'create'} user`)
      }
    } catch (err) {
      setError(`Failed to ${editingUser ? 'update' : 'create'} user`)
    }
  }

  const handleToggleActive = async (userId, isActive) => {
    try {
      const response = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      const data = await response.json()

      if (data.status === 200) {
        fetchUsers()
      } else {
        setError(data.msg || 'Failed to update user status')
      }
    } catch (err) {
      setError('Failed to update user status')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error'
      case 'country_admin': return 'secondary'
      case 'supervisor': return 'warning'
      case 'supplier': return 'primary'
      case 'accountant': return 'success'
      case 'mod': return 'warning'
      case 'customer': return 'info'
      default: return 'default'
    }
  }

  const getRoleText = (role) => {
    return ROLE_DEFINITIONS[role]?.name || role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <RoleBasedAccess allowedRoles={['admin']}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New User
          </Button>
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
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userItem) => (
                      <TableRow key={userItem._id}>
                        <TableCell>{userItem.name}</TableCell>
                        <TableCell>{userItem.username}</TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleText(userItem.role)}
                            color={getRoleColor(userItem.role)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {userItem.country && <Typography variant="body2">🌍 {userItem.country}</Typography>}
                          {userItem.companyName && <Typography variant="body2">🏢 {userItem.companyName}</Typography>}
                          {userItem.department && <Typography variant="body2">🏛️ {userItem.department}</Typography>}
                          {!userItem.country && !userItem.companyName && !userItem.department && <Typography variant="body2" color="textSecondary">-</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userItem.provider || 'local'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userItem.isActive ? 'Active' : 'Inactive'}
                            color={userItem.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {userItem.lastLogin 
                            ? new Date(userItem.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(userItem)}
                            title="Edit User"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(userItem._id, userItem.isActive)}
                            title={userItem.isActive ? 'Deactivate' : 'Activate'}
                            color={userItem.isActive ? 'error' : 'success'}
                          >
                            {userItem.isActive ? <DeleteIcon /> : <ViewIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add/Edit User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
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
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleInputChange}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Role-specific fields */}
              {formData.role === 'country_admin' && (
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                  helperText="Country or region this admin manages"
                />
              )}
              
              {(['supplier', 'supervisor'].includes(formData.role)) && (
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                  helperText="Tour company or organization name"
                />
              )}
              
              {formData.role === 'supplier' && supervisors.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Managed By (Supervisor)</InputLabel>
                  <Select
                    name="managedBy"
                    value={formData.managedBy}
                    label="Managed By (Supervisor)"
                    onChange={handleInputChange}
                  >
                    {supervisors.map((supervisor) => (
                      <MenuItem key={supervisor._id} value={supervisor._id}>
                        {supervisor.name} ({supervisor.companyName})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {formData.role === 'accountant' && (
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                  helperText="Finance, Accounting, or Payroll department"
                />
              )}
              
              <TextField
                fullWidth
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                  />
                }
                label="Active Account"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </RoleBasedAccess>
  )
}