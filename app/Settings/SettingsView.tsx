
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icon } from '../../components/atoms/Icon/icons';
import { apiService } from '../../services/api';

interface BrandSettings {
    tone: string;
    rules: string;
    keywords: string[];
}

interface Integration {
    id: string;
    name: string;
    iconName: string; // Using string keys for Icon component
    connected: boolean;
    description: string;
}

interface ConnectedPage {
    id: string;
    name: string;
    platform: string;
    pageId: string;
    avatar?: string;
    followers?: number;
    status: 'active' | 'inactive' | 'pending';
    connectedAt: string;
}

interface CustomAgentSettings {
    platform: string;
    apiKey: string;
    features: {
        planner: boolean;
        chat: boolean;
    };
}

export const SettingsView = () => {
    const [activeTab, setActiveTab] = useState<'integrations' | 'ai-voice' | 'custom-agent'>('integrations');
    const [isLoading, setIsLoading] = useState(false);
    const [previewText, setPreviewText] = useState('');
    
    // -- AI Voice State --
    const [settings, setSettings] = useState<BrandSettings>({
        tone: 'Professional',
        rules: 'Use active voice. Always end with a call to action.',
        keywords: ['Efficiency', 'Automation']
    });
    const [newKeyword, setNewKeyword] = useState('');

    // -- Integrations State --
    const [integrations, setIntegrations] = useState<Integration[]>([
        { id: 'facebook', name: 'Facebook Page', iconName: 'facebook', connected: true, description: 'Publish and schedule posts to your business page.' },
        { id: 'instagram', name: 'Instagram Business', iconName: 'instagram', connected: false, description: 'Post images and stories directly.' },
        { id: 'gmail', name: 'Gmail', iconName: 'mail', connected: true, description: 'Draft and send emails via CRM workflows.' },
    ]);

    // -- Custom Agent State --
    const [customAgent, setCustomAgent] = useState<CustomAgentSettings>({
        platform: 'Google Gemini',
        apiKey: '',
        features: {
            planner: false,
            chat: false
        }
    });

    // -- Connected Pages State --
    const [connectedPages, setConnectedPages] = useState<ConnectedPage[]>([]);
    const [pagesLoading, setPagesLoading] = useState(false);
    const [pagesError, setPagesError] = useState<string | null>(null);

    // -- Integration Popup State --
    const [showIntegrationPopup, setShowIntegrationPopup] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [integrationApiKey, setIntegrationApiKey] = useState('');
    const [integrationSubmitting, setIntegrationSubmitting] = useState(false);
    const [integrationError, setIntegrationError] = useState<string | null>(null);

    // Load settings from local storage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('orca_brand_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }

        const savedAgentSettings = localStorage.getItem('orca_custom_agent_settings');
        if (savedAgentSettings) {
            const parsed = JSON.parse(savedAgentSettings);
            setCustomAgent({
                platform: parsed.platform || 'Google Gemini',
                apiKey: parsed.apiKey || '',
                features: parsed.features || { planner: false, chat: false }
            });
        }
    }, []);

    // Fetch connected pages when integrations tab is active
    useEffect(() => {
        if (activeTab === 'integrations') {
            fetchConnectedPages();
        }
    }, [activeTab]);

    const fetchConnectedPages = async () => {
        setPagesLoading(true);
        setPagesError(null);
        try {
            const response = await apiService.get<ConnectedPage[]>('/tenant/social-pages');
            setConnectedPages(response);
        } catch (error: any) {
            setPagesError(error.message || 'Không thể tải danh sách trang');
            setConnectedPages([]);
        } finally {
            setPagesLoading(false);
        }
    };

    const handleDisconnectPage = async (pageId: string) => {
        if (!confirm('Bạn có chắc muốn ngắt kết nối trang này?')) return;
        
        try {
            await apiService.delete(`/tenant/social-pages/${pageId}`);
            setConnectedPages(prev => prev.filter(p => p.id !== pageId));
        } catch (error: any) {
            alert(error.message || 'Không thể ngắt kết nối trang');
        }
    };

    const formatFollowers = (count?: number) => {
        if (!count) return '—';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'facebook': return 'facebook';
            case 'instagram': return 'instagram';
            case 'gmail': 
            case 'email': return 'mail';
            default: return 'globe';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return { label: 'Hoạt động', className: 'status-active' };
            case 'inactive': return { label: 'Tạm ngưng', className: 'status-inactive' };
            case 'pending': return { label: 'Đang chờ', className: 'status-pending' };
            default: return { label: status, className: '' };
        }
    };

    const handleSaveSettings = () => {
        localStorage.setItem('orca_brand_settings', JSON.stringify(settings));
        alert('Brand Voice settings saved successfully!');
    };

    const handleSaveCustomAgent = () => {
        localStorage.setItem('orca_custom_agent_settings', JSON.stringify(customAgent));
        alert('Custom Agent configuration saved successfully!');
    };

    const handleAddKeyword = () => {
        if (newKeyword.trim() && !settings.keywords.includes(newKeyword.trim())) {
            setSettings(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword.trim()] }));
            setNewKeyword('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        setSettings(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== keyword) }));
    };

    const openIntegrationPopup = (integration: Integration) => {
        setSelectedIntegration(integration);
        setIntegrationApiKey('');
        setIntegrationError(null);
        setShowIntegrationPopup(true);
    };

    const closeIntegrationPopup = () => {
        setShowIntegrationPopup(false);
        setSelectedIntegration(null);
        setIntegrationApiKey('');
        setIntegrationError(null);
    };

    const handleIntegrationSubmit = async () => {
        if (!selectedIntegration || !integrationApiKey.trim()) {
            setIntegrationError('Vui lòng nhập API Key');
            return;
        }

        setIntegrationSubmitting(true);
        setIntegrationError(null);

        try {
            await apiService.post('/tenant/social-pages', {
                platform: selectedIntegration.id,
                accessToken: integrationApiKey.trim()
            });
            // Close popup and reload pages list
            closeIntegrationPopup();
            fetchConnectedPages();
        } catch (error: any) {
            setIntegrationError(error.message || 'Không thể kết nối trang. Vui lòng kiểm tra lại API Key.');
        } finally {
            setIntegrationSubmitting(false);
        }
    };

    const toggleAgentFeature = (feature: 'planner' | 'chat') => {
        setCustomAgent(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feature]: !prev.features[feature]
            }
        }));
    };

    const generatePreview = async () => {
        setIsLoading(true);
        try {
            // Check if custom agent is enabled for planner (since preview simulates generation)
            let apiKey = process.env.API_KEY;
            if (customAgent.apiKey && customAgent.features.planner && customAgent.platform === 'Google Gemini') {
                apiKey = customAgent.apiKey;
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                You are a social media manager for the brand "OrcaFlow".
                
                Writing Guidelines:
                1. Tone: ${settings.tone}
                2. Rules: ${settings.rules}
                3. Mandatory Keywords to include: ${settings.keywords.join(', ')}

                Task: Write a short social media post (max 280 chars) announcing a new feature called "AI Workspace".
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setPreviewText(response.text || 'Failed to generate preview.');
        } catch (error) {
            console.error(error);
            setPreviewText('Error generating preview. Please check your API key.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="marketing-container">
            <div className="marketing-tabs">
                <div className={`marketing-tab ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>Integrations</div>
                <div className={`marketing-tab ${activeTab === 'ai-voice' ? 'active' : ''}`} onClick={() => setActiveTab('ai-voice')}>AI Brand Voice</div>
                <div className={`marketing-tab ${activeTab === 'custom-agent' ? 'active' : ''}`} onClick={() => setActiveTab('custom-agent')}>Custom Agent</div>
            </div>

            <div className="marketing-content" style={{ padding: '2rem' }}>
                {activeTab === 'integrations' && (
                    <div className="settings-section">
                        <div className="settings-header">
                            <h3>Connected Accounts</h3>
                            <p>Connect your social accounts to enable auto-publishing.</p>
                        </div>
                        <div className="integrations-grid">
                            {integrations.map(integration => (
                                <div key={integration.id} className={`integration-card`}>
                                    <div className="integration-icon">
                                        <Icon name={integration.iconName} />
                                    </div>
                                    <div className="integration-details">
                                        <h4>{integration.name}</h4>
                                        <p>{integration.description}</p>
                                    </div>
                                    <button 
                                        className={`integration-toggle`}
                                        onClick={() => openIntegrationPopup(integration)}
                                    >
                                        Connect
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Connected Pages List */}
                        <div className="connected-pages-section">
                            <div className="section-header-row">
                                <h3>Danh sách trang đã kết nối</h3>
                                <button className="icon-button" onClick={fetchConnectedPages} disabled={pagesLoading}>
                                    <Icon name="refresh" />
                                </button>
                            </div>

                            {pagesLoading && (
                                <div className="pages-loading">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <p>Đang tải danh sách trang...</p>
                                </div>
                            )}

                            {pagesError && (
                                <div className="pages-error">
                                    <Icon name="alertCircle" />
                                    <p>{pagesError}</p>
                                    <button className="generic-button" onClick={fetchConnectedPages}>
                                        Thử lại
                                    </button>
                                </div>
                            )}

                            {!pagesLoading && !pagesError && connectedPages.length === 0 && (
                                <div className="pages-empty">
                                    <Icon name="inbox" />
                                    <p>Chưa có trang nào được kết nối</p>
                                    <span>Kết nối tài khoản ở trên để bắt đầu</span>
                                </div>
                            )}

                            {!pagesLoading && !pagesError && connectedPages.length > 0 && (
                                <div className="connected-pages-list">
                                    <div className="pages-table-header">
                                        <span className="col-page">Trang</span>
                                        <span className="col-platform">Nền tảng</span>
                                        <span className="col-followers">Followers</span>
                                        <span className="col-status">Trạng thái</span>
                                        <span className="col-date">Ngày kết nối</span>
                                        <span className="col-actions">Thao tác</span>
                                    </div>
                                    {connectedPages.map(page => {
                                        const status = getStatusBadge(page.status);
                                        return (
                                            <div key={page.id} className="connected-page-item">
                                                <div className="col-page">
                                                    <div className="page-avatar">
                                                        {page.avatar ? (
                                                            <img src={page.avatar} alt={page.name} />
                                                        ) : (
                                                            <Icon name={getPlatformIcon(page.platform)} />
                                                        )}
                                                    </div>
                                                    <div className="page-info">
                                                        <span className="page-name">{page.name}</span>
                                                        <span className="page-id">ID: {page.pageId}</span>
                                                    </div>
                                                </div>
                                                <div className="col-platform">
                                                    <span className={`platform-badge ${page.platform.toLowerCase()}`}>
                                                        <Icon name={getPlatformIcon(page.platform)} />
                                                        {page.platform}
                                                    </span>
                                                </div>
                                                <div className="col-followers">
                                                    {formatFollowers(page.followers)}
                                                </div>
                                                <div className="col-status">
                                                    <span className={`status-badge ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="col-date">
                                                    {formatDate(page.createdAt)}
                                                </div>
                                                <div className="col-actions">
                                                    <button 
                                                        className="action-btn disconnect"
                                                        onClick={() => handleDisconnectPage(page.id)}
                                                        title="Ngắt kết nối"
                                                    >
                                                        <Icon name="x" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'ai-voice' && (
                    <div className="settings-section">
                        <div className="settings-grid">
                            <div className="settings-form-column">
                                <div className="settings-header">
                                    <h3>Writing Configuration</h3>
                                    <p>Define how the AI should write your content. These settings will be applied automatically in the Planner.</p>
                                </div>

                                <div className="form-group">
                                    <label>Tone of Voice</label>
                                    <select 
                                        value={settings.tone} 
                                        onChange={(e) => setSettings({...settings, tone: e.target.value})}
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Friendly & Casual">Friendly & Casual</option>
                                        <option value="Witty & Humorous">Witty & Humorous</option>
                                        <option value="Luxury & Elegant">Luxury & Elegant</option>
                                        <option value="Urgent & Sales-driven">Urgent & Sales-driven</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Writing Principles (Rules)</label>
                                    <textarea 
                                        rows={4}
                                        value={settings.rules}
                                        onChange={(e) => setSettings({...settings, rules: e.target.value})}
                                        placeholder="E.g., Never use hashtags in the first sentence. Always use emojis sparingly."
                                    />
                                    <p className="helper-text">Specific instructions the AI must follow.</p>
                                </div>

                                <div className="form-group">
                                    <label>Brand Keywords</label>
                                    <div className="keywords-container">
                                        {settings.keywords.map(kw => (
                                            <span key={kw} className="keyword-tag">
                                                {kw}
                                                <button onClick={() => handleRemoveKeyword(kw)}>&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="keyword-input-wrapper">
                                        <input 
                                            type="text" 
                                            value={newKeyword}
                                            onChange={(e) => setNewKeyword(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                                            placeholder="Add a keyword (Press Enter)"
                                        />
                                        <button className="icon-button" onClick={handleAddKeyword}><Icon name="plus" /></button>
                                    </div>
                                </div>

                                <button className="add-contact-button" onClick={handleSaveSettings}>
                                    Save Configuration
                                </button>
                            </div>

                            <div className="settings-preview-column">
                                <div className="preview-card">
                                    <h4>AI Output Preview</h4>
                                    <p className="preview-desc">See how your current settings affect content generation.</p>
                                    
                                    <div className="preview-box">
                                        {isLoading ? (
                                            <div className="typing-indicator"><span></span><span></span><span></span></div>
                                        ) : (
                                            <p>{previewText || "Click 'Generate Sample' to see a preview."}</p>
                                        )}
                                    </div>

                                    <button className="generic-button full-width" onClick={generatePreview} disabled={isLoading}>
                                        Generate Sample
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'custom-agent' && (
                    <div className="settings-section">
                        <div className="settings-header">
                            <h3>Bring Your Own Agent</h3>
                            <p>Connect your own AI agent to override the system default for specific features.</p>
                        </div>
                        
                        <div className="settings-form-column" style={{ maxWidth: '600px' }}>
                            <div className="form-group">
                                <label>Agent Platform</label>
                                <select 
                                    value={customAgent.platform}
                                    onChange={(e) => setCustomAgent({...customAgent, platform: e.target.value})}
                                >
                                    <option value="Google Gemini">Google Gemini</option>
                                    <option value="OpenAI">OpenAI (GPT-4)</option>
                                    <option value="Anthropic">Anthropic (Claude)</option>
                                    <option value="Mistral">Mistral</option>
                                    <option value="Custom">Custom Endpoint</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>API Key</label>
                                <input 
                                    type="password" 
                                    placeholder={`Enter your ${customAgent.platform} API Key`} 
                                    value={customAgent.apiKey}
                                    onChange={(e) => setCustomAgent({...customAgent, apiKey: e.target.value})}
                                />
                                <p className="helper-text">Your key is stored locally in your browser and used only for the selected features below.</p>
                            </div>

                            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--brand-primary)' }}>Feature Overrides</h4>
                            
                            <div className="list-item" onClick={() => toggleAgentFeature('planner')}>
                                <div className="list-item-content">
                                    <p className="list-item-title">Planner Agent</p>
                                    <p className="list-item-platform">Use this agent for generating social media posts and captions.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={customAgent.features.planner}
                                    onChange={() => toggleAgentFeature('planner')}
                                    className="contact-selection-checkbox"
                                    style={{ marginLeft: '1rem' }}
                                />
                            </div>

                            <div className="list-item" onClick={() => toggleAgentFeature('chat')}>
                                <div className="list-item-content">
                                    <p className="list-item-title">Chatbox Agent (Kai)</p>
                                    <p className="list-item-platform">Use this agent for the main AI conversational assistant.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={customAgent.features.chat}
                                    onChange={() => toggleAgentFeature('chat')}
                                    className="contact-selection-checkbox"
                                    style={{ marginLeft: '1rem' }}
                                />
                            </div>

                            <button className="add-contact-button" style={{ marginTop: '2rem' }} onClick={handleSaveCustomAgent}>
                                Save Agent Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Integration Popup Modal */}
            {showIntegrationPopup && selectedIntegration && (
                <div className="modal-overlay" onClick={closeIntegrationPopup}>
                    <div className="integration-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="popup-icon">
                                <Icon name={selectedIntegration.iconName} />
                            </div>
                            <h3>Kết nối {selectedIntegration.name}</h3>
                            <button className="popup-close" onClick={closeIntegrationPopup}>
                                <Icon name="x" />
                            </button>
                        </div>
                        
                        <div className="popup-body">
                            <p className="popup-description">
                                Nhập API Key để kết nối tài khoản {selectedIntegration.name} của bạn.
                            </p>
                            <input type="hidden" name="platform" value={selectedIntegration.id} />
                            <div className="form-group">
                                <label>API Key</label>
                                <input 
                                    type="password"
                                    placeholder={`Nhập ${selectedIntegration.name} API Key`}
                                    value={integrationApiKey}
                                    onChange={(e) => setIntegrationApiKey(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleIntegrationSubmit()}
                                    disabled={integrationSubmitting}
                                />
                            </div>

                            {integrationError && (
                                <div className="popup-error">
                                    <Icon name="alertCircle" />
                                    <span>{integrationError}</span>
                                </div>
                            )}
                        </div>

                        <div className="popup-footer">
                            <button 
                                className="generic-button secondary" 
                                onClick={closeIntegrationPopup}
                                disabled={integrationSubmitting}
                            >
                                Hủy
                            </button>
                            <button 
                                className="add-contact-button" 
                                onClick={handleIntegrationSubmit}
                                disabled={integrationSubmitting || !integrationApiKey.trim()}
                            >
                                {integrationSubmitting ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Đang kết nối...
                                    </>
                                ) : (
                                    'Kết nối'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
    