import axios from 'axios';
import { API_BASE } from './apiBase';
import API_CONFIG from '../config/api.config';

// Dynamic base URL (device/emulator friendly) – align with other services
// Fallback to API_CONFIG.BASE_URL only if API_BASE is undefined (should rarely happen)
const EFFECTIVE_BASE = API_BASE || API_CONFIG.BASE_URL;
const API_BASE_URL = `${EFFECTIVE_BASE}/api/support/tickets`;
console.log('[SupportTicketService] Using base URL:', API_BASE_URL);

export type UserRole = 'CUSTOMER' | 'HUB_AGENT' | 'DELIVERY_AGENT' | 'SUPER_ADMIN';

export interface SupportTicket {
  id?: number;
  userId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  resolutionHistory?: string;
  hubRegion?: string;
  notes?: string;
  attachments?: string;
  raisedByName?: string;
  raisedByRole?: UserRole;
  raisedByLocation?: string;
}

export interface TicketAttachment {
  id?: number;
  ticketId?: number;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedByRole?: string;
  uploadedAt?: string;
  description?: string;
}

export interface DashboardStats {
  open: number;
  inProgress: number;
  closed: number;
  total: number;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  hub?: string;
  assignedTo?: string;
  sort?: 'newest' | 'oldest' | 'priority';
}

class SupportTicketService {
  private getAuthHeaders() {
    // Add authentication headers if needed
    return {
      'Content-Type': 'application/json',
      // Add token if using authentication
      // 'Authorization': `Bearer ${token}`
    };
  }

  async createTicket(ticket: Omit<SupportTicket, 'id'>): Promise<SupportTicket> {
    try {
      const response = await axios.post(API_BASE_URL, ticket, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async getTicketById(id: number): Promise<SupportTicket> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all tickets:', (error as any).message);
      throw error;
    }
  }

  async getTicketsByUserId(userId: string): Promise<SupportTicket[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  }

  async getTicketsByStatus(status: string): Promise<SupportTicket[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/status/${status}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      throw error;
    }
  }

  async updateTicket(id: number, ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, ticket, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  async updateTicketStatus(
    id: number, 
    status: string, 
    resolution?: string,
    performedBy?: string,
    performedByRole?: string
  ): Promise<SupportTicket> {
    try {
      const payload: any = { status };
      
      if (resolution) {
        payload.resolution = resolution;
      }
      if (performedBy) {
        payload.performedBy = performedBy;
      }
      if (performedByRole) {
        payload.performedByRole = performedByRole;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/${id}/status`,
        payload,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async deleteTicket(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  async getTicketCountByStatus(status: string): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/status/${status}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket count:', error);
      throw error;
    }
  }

  async getTicketCountByUser(userId: string): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/user/${userId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user ticket count:', error);
      throw error;
    }
  }

  async getFilteredTickets(filters: TicketFilters): Promise<SupportTicket[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.hub) params.append('hub', filters.hub);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await axios.get(`${API_BASE_URL}?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered tickets:', error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', (error as any).message);
      throw error;
    }
  }

  async assignTicket(
    ticketId: number,
    assignmentData: {
      assignedTo: string;
      priority?: string;
      comment?: string;
      performedBy: string;
      performedByRole: string;
    }
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${ticketId}/assign`,
        assignmentData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }

  async uploadAttachment(
    ticketId: number,
    file: File | Blob,
    uploadedBy: string,
    uploadedByRole: string,
    description?: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', uploadedBy);
      formData.append('uploadedByRole', uploadedByRole);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(
        `${API_BASE_URL}/${ticketId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  async getAttachments(ticketId: number): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${ticketId}/attachments`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  }

  async addNote(
    ticketId: number,
    noteData: {
      note: string;
      performedBy: string;
      performedByRole: string;
    }
  ): Promise<SupportTicket> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${ticketId}/notes`,
        noteData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  async deleteAttachment(
    attachmentId: number,
    deletedBy: string,
    deletedByRole: string
  ): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/attachments/${attachmentId}`,
        {
          params: { deletedBy, deletedByRole },
          headers: this.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  }
}

export default new SupportTicketService();
