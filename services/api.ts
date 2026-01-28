// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        console.log('API_BASE_URL', this.baseUrl);
    }

    /**
     * Get JWT token from localStorage
     */
    public getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }

    /**
     * Set JWT token to localStorage
     */
    public setToken(token: string): void {
        localStorage.setItem('jwt_token', token);
    }

    /**
     * Remove JWT token from localStorage
     */
    public removeToken(): void {
        localStorage.removeItem('jwt_token');
    }

    /**
     * Build headers with authentication
     */
    private getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * Handle API response
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error: ApiError = {
                message: 'An error occurred',
                status: response.status,
            };

            try {
                const errorData = await response.json();
                error.message = errorData.message || errorData.error || 'An error occurred';
                error.errors = errorData.errors;
            } catch (e) {
                // If response is not JSON, use status text
                error.message = response.statusText || 'An error occurred';
            }

            // If token is invalid or expired (401), clear it
            if (response.status === 401) {
                this.removeToken();
                // Optionally trigger logout or redirect
                window.dispatchEvent(new Event('unauthorized'));
            }

            throw error;
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return {} as T;
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(includeAuth),
        });

        return this.handleResponse<T>(response);
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
        console.log('API_BASE_URL', this.baseUrl);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(includeAuth),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(includeAuth),
        });

        return this.handleResponse<T>(response);
    }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export types
export type { ApiError };

