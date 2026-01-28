// User Management Types - matching backend DTOs

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HUB_ADMIN = 'HUB_ADMIN',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  CUSTOMER = 'CUSTOMER',
}

export enum AccessLevel {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: string;
  userId: string;
  fullName: string;
  role: RoleType;
  status: UserStatus;
  assignedHubName: string | null;
  assignedHubCode: string | null;
  accessLevel: AccessLevel;
  lastLogin: string | null;
  lastLoginIp: string | null;
  lastLoginDevice: string | null;
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  DETAILS_UPDATED = 'DETAILS_UPDATED',
  USER_CREATED = 'USER_CREATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_ACTIVATED = 'USER_ACTIVATED',
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  userName: string;
  activityType: ActivityType;
  description: string;
  ipAddress: string | null;
  deviceInfo: string | null;
  timestamp: string;
}

export interface RoleAssignmentRequest {
  role: RoleType;
  accessLevel: AccessLevel;
  hubId?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Helper function to get display name for roles
export function getRoleDisplayName(role: RoleType): string {
  switch (role) {
    case RoleType.SUPER_ADMIN:
      return 'Super Admin';
    case RoleType.HUB_ADMIN:
      return 'Hub Admin';
    case RoleType.DELIVERY_PARTNER:
      return 'Delivery Partner';
    case RoleType.CUSTOMER:
      return 'Customer';
    default:
      return role;
  }
}

// Helper function to get display name for access levels
export function getAccessLevelDisplayName(level: AccessLevel): string {
  switch (level) {
    case AccessLevel.READ:
      return 'Read';
    case AccessLevel.WRITE:
      return 'Write';
    case AccessLevel.ADMIN:
      return 'Admin';
    default:
      return level;
  }
}
