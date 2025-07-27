import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { MKWW_STUDIO_CONFIG } from '../config';
import { useAuth } from '../contexts/AuthContext';

class MKWWStudioService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: `${MKWW_STUDIO_CONFIG.BASE_URL}${MKWW_STUDIO_CONFIG.API_PREFIX}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers[MKWW_STUDIO_CONFIG.AUTH_HEADER] = this.authToken;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized error (e.g., redirect to login)
          console.error('MKWW Studio API: Unauthorized access');
        }
        return Promise.reject(error);
      }
    );
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Verify API connection and authentication
  async verifyConnection(): Promise<boolean> {
    try {
      const response = await this.api.get(MKWW_STUDIO_CONFIG.ENDPOINTS.VERIFY_TOKEN);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to verify MKWW Studio connection:', error);
      return false;
    }
  }

  // Get user profile from MKWW Studio
  async getUserProfile(): Promise<any> {
    try {
      const response = await this.api.get(MKWW_STUDIO_CONFIG.ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  // Sync users with MKWW Studio
  async syncUsers(users: any[]): Promise<any> {
    try {
      const response = await this.api.post(MKWW_STUDIO_CONFIG.ENDPOINTS.SYNC_USERS, { users });
      return response.data;
    } catch (error) {
      console.error('Failed to sync users with MKWW Studio:', error);
      throw error;
    }
  }

  // Sync analytics data with MKWW Studio
  async syncAnalytics(analyticsData: any): Promise<any> {
    try {
      const response = await this.api.post(MKWW_STUDIO_CONFIG.ENDPOINTS.SYNC_ANALYTICS, analyticsData);
      return response.data;
    } catch (error) {
      console.error('Failed to sync analytics with MKWW Studio:', error);
      throw error;
    }
  }

  // Generic request method for other API calls
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.request<T>(config);
      return response.data;
    } catch (error) {
      console.error('MKWW Studio API request failed:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const mkwwStudioService = new MKWWStudioService();

// React hook for using the service
export const useMKWWStudio = () => {
  const { user } = useAuth();
  
  // Set auth token if user is authenticated
  if (user?.mkwwStudioToken) {
    mkwwStudioService.setAuthToken(user.mkwwStudioToken);
  }

  return mkwwStudioService;
};

export default mkwwStudioService;
