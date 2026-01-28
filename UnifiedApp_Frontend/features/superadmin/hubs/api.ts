import { API_BASE_URL } from '@/constants/api';
import {
    GroupedHubs,
    HubCreateRequest,
    HubDetail,
    HubStatus,
    HubSummary,
    HubUpdateRequest,
} from './types';

const HUB_ENDPOINTS = {
  LIST: '/hubs',
  GROUPED: '/hubs/grouped',
  DETAIL: (id: string) => `/hubs/${id}`,
  BY_CODE: (code: string) => `/hubs/code/${code}`,
  TOGGLE_STATUS: (id: string) => `/hubs/${id}/toggle-status`,
  UPDATE_STATUS: (id: string) => `/hubs/${id}/status`,
  CITIES: '/hubs/meta/cities',
  REGIONS: '/hubs/meta/regions',
};

/**
 * Fetch all hubs with optional filters
 */
export async function fetchHubs(
  status?: HubStatus,
  search?: string
): Promise<HubSummary[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const url = `${API_BASE_URL}${HUB_ENDPOINTS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('🔵 Fetching hubs from:', url);
  console.log('🔵 API_BASE_URL:', API_BASE_URL);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error('❌ Request timeout after 30 seconds');
    controller.abort();
  }, 30000); // 30 second timeout
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch hubs: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Received hubs:', data.length);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Fetch hubs error:', error);
    throw error;
  }
}

/**
 * Fetch hubs grouped by city
 */
export async function fetchHubsGrouped(
  status?: HubStatus,
  search?: string
): Promise<GroupedHubs> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const url = `${API_BASE_URL}${HUB_ENDPOINTS.GROUPED}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch grouped hubs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch hub details by ID
 */
export async function fetchHubById(id: string): Promise<HubDetail> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.DETAIL(id)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch hub: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch hub details by code
 */
export async function fetchHubByCode(code: string): Promise<HubDetail> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.BY_CODE(code)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch hub: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new hub
 */
export async function createHub(data: HubCreateRequest): Promise<HubDetail> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.LIST}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create hub: ${error}`);
  }

  return response.json();
}

/**
 * Update an existing hub
 */
export async function updateHub(
  id: string,
  data: HubUpdateRequest
): Promise<HubDetail> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.DETAIL(id)}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update hub: ${error}`);
  }

  return response.json();
}

/**
 * Toggle hub status between ACTIVE and INACTIVE
 */
export async function toggleHubStatus(id: string): Promise<HubDetail> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.TOGGLE_STATUS(id)}`;
  const response = await fetch(url, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle hub status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update hub status
 */
export async function updateHubStatus(id: string, status: HubStatus): Promise<HubSummary> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.UPDATE_STATUS(id)}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update hub status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a hub
 */
export async function deleteHub(id: string): Promise<void> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.DETAIL(id)}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete hub: ${response.statusText}`);
  }
}

/**
 * Fetch all distinct cities
 */
export async function fetchCities(): Promise<string[]> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.CITIES}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch cities: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all distinct regions
 */
export async function fetchRegions(): Promise<string[]> {
  const url = `${API_BASE_URL}${HUB_ENDPOINTS.REGIONS}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch regions: ${response.statusText}`);
  }

  return response.json();
}
