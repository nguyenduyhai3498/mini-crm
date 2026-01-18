import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingService';
import { Icon } from '../../components/atoms/Icon/icons';
import { Language } from '../App';

export interface BrandDNA {
    industry: string;
    targetAudience: string;
    offerings: string;
    archetype: string;
    tone: string;
    defaultLanguage: 'English' | 'Vietnamese';
    exemplar: string;
    forbiddenKeywords: string[];
}

// Added ContentStrategy interface to resolve compilation error in AIAgentView
export interface ContentStrategy {
    objective: string;
    format: string;
    focus: string;
    occasion: string;
    ctaIntent: string;
    overrideLanguage: string;
    overrideCTAUrl: string;
}

export interface SystemSettings {
    language: string;
    timezone: string;
}

const defaultSystem: SystemSettings = {
    language: 'en',
    timezone: 'ICT (Bangkok, Hanoi, Jakarta)',
};

const archetypes = [
    {
        "id": "",
        "name": "Choose your archetype",
        "lang": {
            "en": "",
            "vi": ""
        }
    },
    {
        "id": "The Sage (Knowledgeable, Teacher)",
        "name": "The Sage (Knowledgeable, Teacher)",
        "lang": {
            "en": "The Sage (Knowledgeable, Teacher)",
            "vi": "Vị thầy (Biết, Giáo viên)"
        }
    },
    {
        "id": "The Hero (Bold, Problem-Solver)",
        "name": "The Hero (Bold, Problem-Solver)",
        "lang": {
            "en": "The Hero (Bold, Problem-Solver)",
            "vi": "Người hùng (Táo bạo, Giải quyết vấn đề)"
        }
    },
    {
        "id": "The Innocent (Optimistic, Simple)",
        "name": "The Innocent (Optimistic, Simple)",
        "lang": {
            "en": "The Innocent (Optimistic, Simple)",
            "vi": "Người vô tội (Tối ưu, Đơn giản)"
        }
    },
    {
        "id": "The Explorer (Freedom, Discovery)",
        "name": "The Explorer (Freedom, Discovery)",
        "lang": {
            "en": "The Explorer (Freedom, Discovery)",
            "vi": "Người khám phá (Tự do, Khám phá)"
        }
    },
    {
        "id": "The Creator (Innovative, Visionary)",
        "name": "The Creator (Innovative, Visionary)",
        "lang": {
            "en": "The Creator (Innovative, Visionary)",
            "vi": "Người tạo (Sáng tạo, Tưởng tượng)"
        }
    },
    {
        "id": "The Ruler (Authority, Leadership)",
        "name": "The Ruler (Authority, Leadership)",
        "lang": {
            "en": "The Ruler (Authority, Leadership)",
            "vi": "Người lãnh đạo (Quyền lực, Lãnh đạo)"
        }
    },
    {
        "id": "The Magician (Transformative, Dynamic)",
        "name": "The Magician (Transformative, Dynamic)",
        "lang": {
            "en": "The Magician (Transformative, Dynamic)",
            "vi": "Người bạo (Biến hóa, Động)"
        }
    },
    {
        "id": "The Outlaw (Challenger, Rebellious)",
        "name": "The Outlaw (Challenger, Rebellious)",
        "lang": {
            "en": "The Outlaw (Challenger, Rebellious)",
            "vi": "Người tội phạm (Thử thách, Phản đối)"
        }
    },
    {
        "id": "The Caregiver (Supportive, Altruistic)",
        "name": "The Caregiver (Supportive, Altruistic)",
        "lang": {
            "en": "The Caregiver (Supportive, Altruistic)",
            "vi": "Người chăm sóc (Hỗ trợ, Altruistic)"
        }
    },
    {
        "id": "The Everyman (Relatable, Honest)",
        "name": "The Everyman (Relatable, Honest)",
        "lang": {
            "en": "The Everyman (Relatable, Honest)",
            "vi": "Người thường (Quan trọng, Trung thực)"
        }
    },
    {
        "id": "The Jester (Playful, Entertaining)",
        "name": "The Jester (Playful, Entertaining)",
        "lang": {
            "en": "The Jester (Playful, Entertaining)",
            "vi": "Người nghịch (Vui vẻ, Thú vị)"
        }
    },
    {
        "id": "The Lover (Passionate, Aesthetic)",
        "name": "The Lover (Passionate, Aesthetic)",
        "lang": {
            "en": "The Lover (Passionate, Aesthetic)",
            "vi": "Người yêu (Thích thú, Aesthetic)"
        }
    },
];

const timezones = [
    "UTC (Coordinated Universal Time)",
    "GMT (London, Lisbon)",
    "CET (Paris, Berlin, Rome)",
    "EST (New York, Toronto)",
    "CST (Chicago, Mexico City)",
    "PST (Los Angeles, Vancouver)",
    "ICT (Bangkok, Hanoi, Jakarta)",
    "SGT (Singapore)",
    "JST (Tokyo, Seoul)"
];

const defaultDNA: BrandDNA = {
    industry: 'B2B SaaS / Automation',
    targetAudience: 'SME Founders & Tech Managers',
    offerings: 'OrcaFlow CRM, AI Content Planner, Workflow Automation',
    archetype: 'The Magician (Transformative, Dynamic)',
    tone: 'Expert, encouraging, and clear',
    defaultLanguage: 'English',
    exemplar: 'Automation isn’t about replacing talent; it’s about giving talent the space to lead.',
    forbiddenKeywords: ['clunky', 'difficult', 'expensive'],
  };

export const SettingsView = ({ language, setLanguage }: { language: Language, setLanguage: (l: Language) => void }) => {
    const [activeTab, setActiveTab] = useState<'agent' | 'system'>('agent');

    const [dna, setDna] = useState<BrandDNA>(defaultDNA);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const [system, setSystem] = useState<SystemSettings>(defaultSystem);

    const handleSaveAgent = async () => {
        const res = await settingsService.update(dna, system);
        console.log(res);
        if (res) {
            localStorage.setItem('orca_brand_dna', JSON.stringify(dna));
            alert('Brand DNA configuration saved successfully.');
        } else {
            alert('Failed to save brand DNA configuration.');
        }
    };

    const handleSaveSystem = async () => {
        setLanguage(system.language as Language);
        const res = await settingsService.update(dna, system);
        if (res) {
            alert('System settings updated successfully.');
        } else {
            alert('Failed to update system settings.');
        }
    };

    const handleResetApp = () => {
        if (confirm("Danger: This will clear all local data and settings. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleForbiddenKeywordsChange = (value: string) => {
        const keywords = value.split(',').map(k => k.trim()).filter(k => k !== '');
        setDna({ ...dna, forbiddenKeywords: keywords });
    };

    const changeLanguage = (language: Language) => {
        setLanguage(language);
        setSystem({...system, language: language});
    };

    useEffect(() => {
        if (loaded) return;
      
        const fetchSettings = async () => {
          setLoading(true);
          try {
            const res = await settingsService.getSettings();
            console.log('res', res);
            if (res) {
              setDna(res.brandSettings);
              setLoaded(true);
            }
          } finally {
            setLoading(false);
          }
        };
      
        fetchSettings();
      }, [settingsOpen, loaded]);

    return (
        <>
        {loading && <div className="loading-overlay">Loading...</div>}
        {loaded && (
        <div className="marketing-container" style={{ height: '100%', overflow: 'hidden' }}>
            <div className="marketing-tabs">
                <div className={`marketing-tab ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>
                    {language === 'en' ? 'Agent Settings' : 'Cài đặt Trợ lý'}
                </div>
                <div className={`marketing-tab ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>
                    {language === 'en' ? 'Integrations' : 'Tích hợp'}
                </div>
                <div className={`marketing-tab ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
                    {language === 'en' ? 'System' : 'Hệ thống'}
                </div>
            </div>

            <div className="marketing-content" style={{ padding: '2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    
                    {activeTab === 'agent' && (
                        <div className="settings-section">
                            <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                                <h2 style={{ color: 'var(--brand-primary)', margin: 0, fontSize: '1.75rem' }}>Brand Configuration</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Define the background persona for background content assistance.
                                </p>
                            </header>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Foundational Identity</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Industry</label>
                                            <input type="text" value={dna.industry} onChange={(e) => setDna({...dna, industry: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Target Audience</label>
                                            <input type="text" value={dna.targetAudience} onChange={(e) => setDna({...dna, targetAudience: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Brand Archetype</label>
                                            <select value={dna.archetype} onChange={(e) => setDna(prev => { return { ...prev, archetype: e.target.value } }) }>
                                                {archetypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Tone of Voice</label>
                                            <input type="text" value={dna.tone} onChange={(e) => setDna({...dna, tone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Core Offerings</label>
                                        <textarea rows={2} value={dna.offerings} onChange={(e) => setDna({...dna, offerings: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Voice Exemplar (Sample post text)</label>
                                        <textarea rows={4} value={dna.exemplar} onChange={(e) => setDna({...dna, exemplar: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Forbidden Keywords (AI Guardrails)</label>
                                        <input type="text" value={dna.forbiddenKeywords.join(', ')} onChange={(e) => handleForbiddenKeywordsChange(e.target.value)} placeholder="e.g. cheap, guarantee, best..." />
                                    </div>
                                    <button className="add-contact-button" onClick={handleSaveAgent} style={{ width: '100%', padding: '1rem', marginTop: '2rem' }}>
                                        <Icon name="check" /> Save DNA Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="settings-section">
                            <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                                <h2 style={{ color: 'var(--brand-primary)', margin: 0, fontSize: '1.75rem' }}>System Configuration</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage interface preferences and local data.</p>
                            </header>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Localization</h4>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label>Interface Language</label>
                                        <select value={language} onChange={(e) => changeLanguage(e.target.value as Language)}>
                                            <option value="en">English (Global)</option>
                                            <option value="vi">Tiếng Việt (Bản địa)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Timezone</label>
                                        <select value={system.timezone} onChange={(e) => setSystem({...system, timezone: e.target.value})}>
                                            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maintenance</h4>
                                    <button className="generic-button" onClick={handleSaveSystem} style={{ width: '100%', marginBottom: '1rem' }}>
                                        Update Preferences
                                    </button>
                                    <button className="delete-button" onClick={handleResetApp} style={{ width: '100%', border: '1px solid #E53E3E', borderRadius: '8px' }}>
                                        <Icon name="trash" /> Clear All Local Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                         <div className="placeholder-view">
                            <Icon name="settings" style={{ width: 48, height: 48, stroke: '#ccc', marginBottom: '1rem' }} />
                            <h2>Integrations Settings</h2>
                            <p>Configure third-party connectors (Zapier, n8n, Slack) to expand your workflow.</p>
                            <button className="generic-button" style={{ marginTop: '1rem' }}>Add Connector</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        )}
        </>
    );
};
