import { API_BASE_URL } from '@/constants/api';
import type { LoginHistoryEntry, PagedResponse, RoleAssignmentRequest, User } from './types';

export interface FetchUsersParams {
  search?: string;
  role?: string;
  status?: string;
  accessLevel?: string;
  hubId?: string;
  hubCode?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

/**
 * Fetch paginated list of users with optional filters
 */
export async function fetchUsers(params: FetchUsersParams = {}): Promise<PagedResponse<User>> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch users');
  }

  return response.json();
}

/**
 * Create a new user
 * POST /api/users/create
 */
export async function createUser(request: {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  accessLevel: string;
  hubId?: string;
}): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create user');
  }

  return response.json();
}

/**
 * Update user details
 * PATCH /api/users/{id}
 */
export async function updateUser(
  userId: string,
  request: {
    fullName?: string;
    role?: string;
    accessLevel?: string;
    hubId?: string;
  }
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update user');
  }

  return response.json();
}

/**
 * Assign or update a user's role and access level
 * PUT /api/users/{id}/role
 */
export async function assignUserRole(
  userId: string,
  request: RoleAssignmentRequest
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to assign role');
  }

  return response.json();
}

/**
 * Update user status
 * POST /api/users/{id}/status
 */
export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update user status');
  }

  return response.json();
}

/**
 * Fetch login history for a specific user
 * GET /api/users/login-history?userId={id}
 */
export async function fetchLoginHistory(
  userId: string,
  params: { page?: number; size?: number; direction?: 'ASC' | 'DESC' } = {}
): Promise<PagedResponse<LoginHistoryEntry>> {
  const queryParams = new URLSearchParams({ userId });
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/users/login-history?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch login history');
  }

  return response.json();
}
