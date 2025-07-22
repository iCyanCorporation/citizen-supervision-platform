// Role-Based Access Control (RBAC) system for the citizen supervision platform

export enum UserRole {
  CITIZEN = "CITIZEN",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  CIVIL_SERVANT = "CIVIL_SERVANT", // For future civil servant portal
}

export enum Permission {
  // Citizen permissions
  VIEW_CIVIL_SERVANTS = "VIEW_CIVIL_SERVANTS",
  CREATE_SUPERVISION = "CREATE_SUPERVISION",
  CREATE_OBLIGATION = "CREATE_OBLIGATION",
  CREATE_KPI = "CREATE_KPI",
  UPDATE_OWN_PROFILE = "UPDATE_OWN_PROFILE",
  EARN_POINTS = "EARN_POINTS",
  SPEND_POINTS = "SPEND_POINTS",

  // Moderator permissions
  MODERATE_CONTENT = "MODERATE_CONTENT",
  VERIFY_EVIDENCE = "VERIFY_EVIDENCE",
  MANAGE_REPORTS = "MANAGE_REPORTS",

  // Admin permissions
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_CIVIL_SERVANTS = "MANAGE_CIVIL_SERVANTS",
  MANAGE_SYSTEM_SETTINGS = "MANAGE_SYSTEM_SETTINGS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  MANAGE_REWARDS = "MANAGE_REWARDS",

  // Civil servant permissions (for future use)
  UPDATE_OWN_OBLIGATIONS = "UPDATE_OWN_OBLIGATIONS",
  UPDATE_OWN_KPIS = "UPDATE_OWN_KPIS",
  VIEW_OWN_SUPERVISION = "VIEW_OWN_SUPERVISION",
}

// Define role permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.CITIZEN]: [
    Permission.VIEW_CIVIL_SERVANTS,
    Permission.CREATE_SUPERVISION,
    Permission.CREATE_OBLIGATION,
    Permission.CREATE_KPI,
    Permission.UPDATE_OWN_PROFILE,
    Permission.EARN_POINTS,
    Permission.SPEND_POINTS,
  ],

  [UserRole.MODERATOR]: [
    // Include all citizen permissions
    ...(rolePermissions[UserRole.CITIZEN] || []),
    Permission.MODERATE_CONTENT,
    Permission.VERIFY_EVIDENCE,
    Permission.MANAGE_REPORTS,
  ],

  [UserRole.ADMIN]: [
    // Include all moderator permissions
    ...(rolePermissions[UserRole.MODERATOR] || []),
    Permission.MANAGE_USERS,
    Permission.MANAGE_CIVIL_SERVANTS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_REWARDS,
  ],

  [UserRole.CIVIL_SERVANT]: [
    Permission.UPDATE_OWN_OBLIGATIONS,
    Permission.UPDATE_OWN_KPIS,
    Permission.VIEW_OWN_SUPERVISION,
    Permission.UPDATE_OWN_PROFILE,
  ],
};

// Fix the circular dependency by defining permissions after roles
rolePermissions[UserRole.MODERATOR] = [
  ...rolePermissions[UserRole.CITIZEN],
  Permission.MODERATE_CONTENT,
  Permission.VERIFY_EVIDENCE,
  Permission.MANAGE_REPORTS,
];

rolePermissions[UserRole.ADMIN] = [
  ...rolePermissions[UserRole.MODERATOR],
  Permission.MANAGE_USERS,
  Permission.MANAGE_CIVIL_SERVANTS,
  Permission.MANAGE_SYSTEM_SETTINGS,
  Permission.VIEW_ANALYTICS,
  Permission.MANAGE_REWARDS,
];

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return rolePermissions[userRole] || [];
}

/**
 * Get user role from user data (for future implementation)
 * For now, all users are citizens
 */
export function getUserRole(userId: string): UserRole {
  // TODO: Implement role lookup from database
  // For now, all users are citizens
  return UserRole.CITIZEN;
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission(
  userRole: UserRole,
  requiredPermission: Permission,
  component: React.ReactNode,
  fallback?: React.ReactNode
): React.ReactNode {
  if (hasPermission(userRole, requiredPermission)) {
    return component;
  }
  return fallback || null;
}

/**
 * Hook for checking permissions (for future use with React components)
 */
export function usePermissions(userRole: UserRole) {
  return {
    hasPermission: (permission: Permission) =>
      hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(userRole, permissions),
    permissions: getRolePermissions(userRole),
  };
}
