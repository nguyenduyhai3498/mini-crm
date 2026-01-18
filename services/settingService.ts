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
    async update(brandSettings: BrandSettings, systemSettings: SystemSettings): Promise<Settings> {
        try {
            const response = await apiService.put<Settings>('/tenant/settings', {brandSettings: brandSettings, systemSettings: systemSettings});
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export const settingsService = new SettingsService();

