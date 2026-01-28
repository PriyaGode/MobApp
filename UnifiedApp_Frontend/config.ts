// Central API config: Unified Backend (port 8080)
import { API_BASE } from './services/apiBase';

// Unified Backend base URL (port 8080)
export const UNIFIED_API_BASE_URL = API_BASE;

// Customer API prefix
export const CUSTOMER_API_BASE_URL = `${API_BASE}/api/customer`;

// Superadmin/Admin API prefix  
export const SUPERADMIN_API_BASE_URL = `${API_BASE}/api/admin`;

// Default API for backward compatibility
export const API_BASE_URL = API_BASE;

console.log('API Configuration (Unified Backend):');
console.log('- Base URL:', API_BASE);
console.log('- Customer API:', CUSTOMER_API_BASE_URL);
console.log('- Admin API:', SUPERADMIN_API_BASE_URL);
