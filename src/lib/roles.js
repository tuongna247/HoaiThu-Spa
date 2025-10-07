// Role Management System with Permissions
export const ROLES = {
  ADMIN: 'admin',
  COUNTRY_ADMIN: 'country_admin',
  SUPPLIER: 'supplier',
  SUPERVISOR: 'supervisor',
  ACCOUNTANT: 'accountant',
  MOD: 'mod',
  CUSTOMER: 'customer'
};

export const PERMISSIONS = {
  SYSTEM_ADMIN: 'system_admin',
  MANAGE_USERS: 'manage_users',
  MANAGE_TOURS: 'manage_tours',
  MANAGE_BOOKINGS: 'manage_bookings',
  MANAGE_FINANCES: 'manage_finances',
  VIEW_ANALYTICS: 'view_analytics',
  APPROVE_SUPPLIERS: 'approve_suppliers',
  MANAGE_COUNTRIES: 'manage_countries'
};

// Role definitions with their default permissions and descriptions
export const ROLE_DEFINITIONS = {
  [ROLES.ADMIN]: {
    name: 'Master Administrator',
    description: 'Full system access and control',
    defaultPermissions: [
      PERMISSIONS.SYSTEM_ADMIN,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_TOURS,
      PERMISSIONS.MANAGE_BOOKINGS,
      PERMISSIONS.MANAGE_FINANCES,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.APPROVE_SUPPLIERS,
      PERMISSIONS.MANAGE_COUNTRIES
    ],
    hierarchy: 1,
    portal: 'admin'
  },
  [ROLES.COUNTRY_ADMIN]: {
    name: 'Country Administrator',
    description: 'Regional management and supplier oversight',
    defaultPermissions: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.APPROVE_SUPPLIERS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.MANAGE_TOURS,
      PERMISSIONS.MANAGE_BOOKINGS
    ],
    hierarchy: 2,
    portal: 'admin',
    requiredFields: ['country']
  },
  [ROLES.SUPPLIER]: {
    name: 'Supplier',
    description: 'Manage tours, activities and bookings',
    defaultPermissions: [
      PERMISSIONS.MANAGE_TOURS,
      PERMISSIONS.MANAGE_BOOKINGS,
      PERMISSIONS.VIEW_ANALYTICS
    ],
    hierarchy: 4,
    portal: 'supplier',
    requiredFields: ['companyName', 'managedBy']
  },
  [ROLES.SUPERVISOR]: {
    name: 'Supervisor',
    description: 'Manage supplier team and sub-accounts',
    defaultPermissions: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_TOURS,
      PERMISSIONS.MANAGE_BOOKINGS,
      PERMISSIONS.VIEW_ANALYTICS
    ],
    hierarchy: 3,
    portal: 'supervisor',
    requiredFields: ['companyName']
  },
  [ROLES.ACCOUNTANT]: {
    name: 'Accountant',
    description: 'Financial reports, invoices and payouts',
    defaultPermissions: [
      PERMISSIONS.MANAGE_FINANCES,
      PERMISSIONS.VIEW_ANALYTICS
    ],
    hierarchy: 3,
    portal: 'accountant',
    requiredFields: ['department']
  },
  [ROLES.MOD]: {
    name: 'Moderator',
    description: 'Content moderation and customer support',
    defaultPermissions: [
      PERMISSIONS.MANAGE_TOURS,
      PERMISSIONS.MANAGE_BOOKINGS
    ],
    hierarchy: 5,
    portal: 'admin'
  },
  [ROLES.CUSTOMER]: {
    name: 'Customer',
    description: 'Book activities and manage personal account',
    defaultPermissions: [],
    hierarchy: 6,
    portal: 'customer'
  }
};

// Permission checks
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  // Admin always has all permissions
  if (user.role === ROLES.ADMIN) return true;
  
  // Check user's specific permissions
  if (user.permissions && user.permissions.includes(permission)) return true;
  
  // Check role's default permissions
  const roleDefinition = ROLE_DEFINITIONS[user.role];
  return roleDefinition?.defaultPermissions?.includes(permission) || false;
};

// Role hierarchy checks
export const canManageRole = (managerRole, targetRole) => {
  const managerHierarchy = ROLE_DEFINITIONS[managerRole]?.hierarchy || 999;
  const targetHierarchy = ROLE_DEFINITIONS[targetRole]?.hierarchy || 999;
  
  // Lower number = higher authority
  return managerHierarchy < targetHierarchy;
};

// Get available roles for a user to create/manage
export const getManageableRoles = (userRole) => {
  const userHierarchy = ROLE_DEFINITIONS[userRole]?.hierarchy || 999;
  
  return Object.entries(ROLE_DEFINITIONS)
    .filter(([role, definition]) => definition.hierarchy > userHierarchy)
    .map(([role, definition]) => ({
      value: role,
      label: definition.name,
      description: definition.description
    }));
};

// Get portal redirect based on role
export const getPortalRoute = (role) => {
  const definition = ROLE_DEFINITIONS[role];
  if (!definition) return '/';
  
  switch (definition.portal) {
    case 'admin':
      return '/admin';
    case 'supplier':
      return '/supplier';
    case 'supervisor':
      return '/supervisor';
    case 'accountant':
      return '/accountant';
    case 'customer':
      return '/dashboard';
    default:
      return '/';
  }
};

// Validate required fields for role
export const validateRoleFields = (role, userData) => {
  const definition = ROLE_DEFINITIONS[role];
  if (!definition || !definition.requiredFields) return { valid: true };
  
  const missingFields = definition.requiredFields.filter(field => !userData[field]);
  
  return {
    valid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0 
      ? `Missing required fields for ${definition.name}: ${missingFields.join(', ')}`
      : null
  };
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_DEFINITIONS,
  hasPermission,
  canManageRole,
  getManageableRoles,
  getPortalRoute,
  validateRoleFields
};