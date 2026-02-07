import { SocialPage } from '@/app/Settings/SettingView';
import { apiService } from './api';

export interface Settings {
    id: number;
    tenantId: string;
    brandSettings: BrandSettings;
    systemSettings: SystemSettings;
}
export interface BrandSettings {
    industry: string;
    targetAudience: string;
    offerings: string;
    archetype: string;
    tone: string;
    defaultLanguage: 'English' | 'Vietnamese' | 'Bilingual (EN + VI)';
    exemplar: string;
    forbiddenKeywords: string[];
}

export interface SystemSettings {
    businessName: string;
    timezone: string;
    dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
    currency: string;
}

export interface ContentStrategy {
    objective: string;
    format: string;
    focus: string;
    occasion: string;
    ctaIntent: string;
    overrideLanguage: string;
    overrideCTAUrl: string;
}

export interface GetPostsParams {
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    platform?: string;
    socialPageId?: string | number;
    status?: 'Scheduled' | 'Posted' | 'All';
}

export interface GetResponse {
    statusCode: number;
    brandSettings: Settings[];
}

export interface RedirectResponse {
    redirect_url: string;
}

class SettingsService {
    /**
     * Get scheduled posts with filters
     */
    async getSettings() {
        try {
            const endpoint = `/tenant/settings`;
            const response = await apiService.get<GetResponse>(endpoint);
            return response;
        } catch (error) {
            return null;
        }
    }

    /**
     * Update a scheduled post
     */
    async update(brandSettings: BrandSettings, systemSettings: SystemSettings, contentStrategy: ContentStrategy): Promise<Settings> {
        try {
            const response = await apiService.put<Settings>('/tenant/settings', {brandSettings: brandSettings, systemSettings: systemSettings, contentStrategy: contentStrategy});
            return response;
        } catch (error) {
            throw error;
        }
    }

    async redirectApp(app: string) {
        try {
            if (app === 'facebook') {
                const response = await apiService.get<RedirectResponse>('/open3rd/facebook/redirect');
                return response;
            }
        } catch (error) {
            throw error;
        }
        return null;
    }

    async getSocialPages() {
        try {
            const response = await apiService.get<SocialPage[]>('/tenant/social-pages');
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteSocialPage(pageId: string) {
        try {
            const response = await apiService.delete<{message: string}>(`/tenant/social-pages/${pageId}`);
            return {
                success: true,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

export const settingsService = new SettingsService();

