import { useState, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
}

/**
 * Custom hook for making API calls with built-in state management
 * Automatically includes JWT token in requests
 * 
 * @example
 * const { data, loading, error, execute } = useApi<Contact[]>();
 * 
 * useEffect(() => {
 *   execute(() => apiService.get('/contacts'));
 * }, []);
 */
export function useApi<T = any>(): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
        setState({ data: null, loading: true, error: null });

        try {
            const result = await apiCall();
            setState({ data: result, loading: false, error: null });
            return result;
        } catch (err) {
            const error = err as ApiError;
            const errorMessage = error.message || 'Đã xảy ra lỗi';
            setState({ data: null, loading: false, error: errorMessage });
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        execute,
        reset,
    };
}

/**
 * Helper hook for GET requests
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch<Contact[]>('/contacts');
 */
export function useFetch<T = any>(endpoint: string, autoFetch: boolean = true) {
    const { data, loading, error, execute } = useApi<T>();

    const fetchData = useCallback(() => {
        return execute(() => apiService.get<T>(endpoint));
    }, [endpoint, execute]);

    // Auto-fetch on mount if enabled
    useState(() => {
        if (autoFetch) {
            fetchData();
        }
    });

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}

/**
 * Export apiService for direct use when needed
 */
export { apiService };

