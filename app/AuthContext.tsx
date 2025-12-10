import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, LoginResponse } from '../services/authService';
import { ApiError } from '../services/api';

interface User {
    id: string | number;
    name: string;
    email: string;
    tenantId: string;
    role: string;
    tenantPermissions: string[];
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check for existing token and validate on mount
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            
            if (authService.hasToken()) {
                try {
                    // Try to get current user with existing token
                    const userProfile = await authService.getCurrentUser();
                    setUser(userProfile);
                } catch (error) {
                    // Token is invalid or expired, clear it
                    console.error('Token validation failed:', error);
                    setUser(null);
                }
            }
            
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    // Listen for unauthorized events (401 responses)
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
        };

        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response: LoginResponse = await authService.login(email, password);
            
            const userData: User = {
                id: response.user.id,
                tenantId: response.user.tenantId,
                name: response.user.fullName,
                email: response.user.email,
                role: response.user.role,
                tenantPermissions: response.user.tenantPermissions,
            };
            
            setUser(userData as User);
        } catch (error) {
            const apiError = error as ApiError;
            throw new Error(apiError.message || 'Đăng nhập thất bại');
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            isLoading,
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

