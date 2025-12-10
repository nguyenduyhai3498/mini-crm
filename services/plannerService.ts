import { apiService } from './api';

export interface ScheduledPost {
    id: number;
    date: string; // YYYY-MM-DD format
    title: string;
    platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Generic';
    content: string;
    attachments: string[] | null;
    status: 'Scheduled' | 'Posted';
    socialPageId?: string | number;
    mediaUrls: string,
    likes: number,
    comments: number,
    shares: number,
    fullPicture: string,
    postedAt: string,
}

export interface GetPostsParams {
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    platform?: string;
    socialPageId?: string | number;
    status?: 'Scheduled' | 'Posted' | 'All';
}

export interface GetPostsResponse {
    posts: ScheduledPost[];
}

class PlannerService {
    /**
     * Get scheduled posts with filters
     */
    async getPosts(params?: GetPostsParams): Promise<GetPostsResponse> {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            if (params?.startDate) {
                queryParams.append('startDate', params.startDate);
            }
            if (params?.endDate) {
                queryParams.append('endDate', params.endDate);
            }
            if (params?.platform && params.platform !== 'All') {
                queryParams.append('platform', params.platform);
            }
            if (params?.socialPageId) {
                queryParams.append('socialPageId', params.socialPageId.toString());
            }
            if (params?.status && params.status !== 'All') {
                queryParams.append('status', params.status);
            }

            const queryString = queryParams.toString();
            const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;
            const response = await apiService.get<GetPostsResponse>(endpoint);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get a single post by ID
     */
    async getPost(postId: number): Promise<ScheduledPost> {
        try {
            const response = await apiService.get<ScheduledPost>(`/posts/${postId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a new scheduled post
     */
    async createPost(post: Omit<ScheduledPost, 'id'>): Promise<ScheduledPost> {
        try {
            const response = await apiService.post<ScheduledPost>('/planner/posts', post);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a scheduled post
     */
    async updatePost(postId: number, post: Partial<ScheduledPost>): Promise<ScheduledPost> {
        try {
            const response = await apiService.put<ScheduledPost>(`/planner/posts/${postId}`, post);
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a scheduled post
     */
    async deletePost(postId: number): Promise<void> {
        try {
            await apiService.delete(`/planner/posts/${postId}`);
        } catch (error) {
            throw error;
        }
    }
}

export const plannerService = new PlannerService();

