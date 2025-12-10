import { apiService } from './api';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: {
        id: string | number;
        fullName: string;
        tenantId: string;
        email: string;
        tenantPermissions: string[];
        role: string;
    };
}

export interface UserProfile {
    id: string | number;
    fullName: string;
    tenantId: string;
    email: string;
    tenantPermissions: string[];
    role: string;
}

class AuthService {
    /**
     * Login user with username and password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await apiService.post<LoginResponse>(
                '/auth/login',
                { email, password },
                false // Don't include auth token for login
            );

            // Save token after successful login
            if (response.access_token) {
                apiService.setToken(response.access_token);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            // Optional: Call logout endpoint to invalidate token on server
            await apiService.post('/auth/logout');
        } catch (error) {
            // Continue with logout even if API call fails
            console.error('Logout API error:', error);
        } finally {
            // Always remove token from client
            apiService.removeToken();
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<UserProfile> {
        try {
            const response = await apiService.get<UserProfile>('/auth/me');
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Refresh JWT token
     */
    async refreshToken(): Promise<string> {
        try {
            const response = await apiService.post<{ token: string }>('/auth/refresh');
            if (response.token) {
                apiService.setToken(response.token);
            }
            return response.token;
        } catch (error) {
            apiService.removeToken();
            throw error;
        }
    }

    /**
     * Verify if token is valid
     */
    async verifyToken(): Promise<boolean> {
        try {
            await apiService.get('/auth/verify');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if user has valid token in localStorage
     */
    hasToken(): boolean {
        return !!localStorage.getItem('jwt_token');
    }
}

export const authService = new AuthService();

