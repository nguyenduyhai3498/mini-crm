import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingService';
import { Icon } from '../../components/atoms/Icon/icons';
import { Language } from '../App';

export interface SocialPage {
    id: string;
    name: string;
    platform: string;
    pageId: string;
    avatar?: string;
    expiresAt: string;
}

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

const DefaultContentStrategy: ContentStrategy = {
    objective: 'Awareness',
    format: 'Long Caption',
    focus: 'AI Content Planner Feature',
    occasion: 'None',
    overrideLanguage: 'No Override',
    overrideCTAUrl: '',
    ctaIntent: 'Soft (Learn more)'
}

const ValidContentStrategy = {
    objective: ['Awareness', 'Education', 'Promotion', 'Engagement', 'Social Proof'],
    format: ['Short Caption', 'Long Caption', 'Carousel', 'Video Script', 'Announcement'],
    occasion: ['None', 'Public Holiday', 'Industry Event', 'Company Milestone', 'Campaign Period'],
    overrideLanguage: ['No Override', 'English', 'Vietnamese', 'Bilingual'],
    ctaIntent: ['Soft (Learn more)', 'Medium (Try it out)', 'Hard (Book a demo)'],
};

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
    dateFormat: string;
    businessName: string;
    currency: string;
}

const defaultSystem: SystemSettings = {
    language: 'en',
    timezone: 'ICT (Bangkok, Hanoi, Jakarta)',
    dateFormat: 'DD/MM/YYYY',
    businessName: '',
    currency: 'USD',
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
    const [socialPages, setSocialPages] = useState<SocialPage[]>([]);

    const [system, setSystem] = useState<SystemSettings>(defaultSystem);

    const [strategy, setStrategy] = useState<ContentStrategy>(() => {
        const saved = localStorage.getItem('orca_content_strategy');
        return saved ? JSON.parse(saved) : DefaultContentStrategy;
    });

    const handleSaveAgent = async () => {
        const res = await settingsService.update(dna, system, strategy);
        console.log(res);
        if (res) {
            localStorage.setItem('orca_brand_dna', JSON.stringify(dna));
            alert('Brand DNA configuration saved successfully.');
        } else {
            alert('Failed to save brand DNA configuration.');
        }
    };

    const handleDeleteSocialPage = async (pageId: string) => {
        const res = await settingsService.deleteSocialPage(pageId);
        
        if (res.success) {
            setSocialPages(socialPages.filter(page => page.id !== pageId));
            alert(res.message);
        } else {
            alert(res.message);
        }
    };

    const handleSaveSystem = async () => {
        setLanguage(system.language as Language);
        const res = await settingsService.update(dna, system, strategy);
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
              setSystem(res.systemSettings);
              setStrategy(res.contentStrategy);
              setLoaded(true);
            }
          } finally {
            setLoading(false);
          }
        };

        const fetchSocialPages = async () => {
            const res = await settingsService.getSocialPages();
            console.log('res', res);
            if (res) {
                setSocialPages(res);
            }
        };

        fetchSocialPages();
      
        fetchSettings();
    }, [settingsOpen, loaded]);

    const redirectApp = async (app: string) => {
        const res = await settingsService.redirectApp(app);
        console.log(res);
        if (res) {
            window.location.href = res.redirect_url;
        }
    };
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
                                <h2 style={{ color: 'var(--brand-primary)', margin: 0, fontSize: '1.75rem' }}>AI Agent Configuration</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Architecting the balance between Brand Identity (DNA) and Marketing Intent (Strategy).
                                </p>
                            </header>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
                                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ borderLeft: '4px solid var(--brand-primary)', paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-primary)' }}>Brand DNA</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>WHO the brand is. (Stable / Long-term)</p>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. Identity & Context</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Industry</label>
                                            <input type="text" value={dna.industry} onChange={(e) => setDna({...dna, industry: e.target.value})} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Target Audience</label>
                                            <input type="text" value={dna.targetAudience} onChange={(e) => setDna({...dna, targetAudience: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Core Offerings</label>
                                            <textarea rows={2} value={dna.offerings} onChange={(e) => setDna({...dna, offerings: e.target.value})} />
                                        </div>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Personality & Style</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Archetype</label>
                                            <select value={dna.archetype} onChange={(e) => setDna(prev => { return { ...prev, archetype: e.target.value } }) }>
                                                {archetypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Tone of Voice</label>
                                            <input type="text" value={dna.tone} onChange={(e) => setDna({...dna, tone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. Defaults & DNA</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Default Output Language</label>
                                            <select value={dna.defaultLanguage} onChange={(e) => setDna({...dna, defaultLanguage: e.target.value as any})}>
                                                <option value="English">English</option>
                                                <option value="Vietnamese">Vietnamese</option>
                                                <option value="Bilingual (EN + VI)">Bilingual (EN + VI)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Perfect Post Sample (Few-shot)</label>
                                            <textarea rows={4} value={dna.exemplar} onChange={(e) => setDna({...dna, exemplar: e.target.value})} />
                                        </div>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>4. Content Guardrails</h4>
                                        <div className="form-group">
                                            <label>Forbidden Keywords</label>
                                            <input type="text" value={dna.forbiddenKeywords.join(', ')} onChange={(e) => handleForbiddenKeywordsChange(e.target.value)} placeholder="e.g. expensive, slow, manual..." />
                                        </div>
                                    </div>
                                </section>

                                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ borderLeft: '4px solid var(--brand-accent)', paddingLeft: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-accent)' }}>Active Content Strategy</h3>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#666' }}>WHAT the AI is doing. (Dynamic / Task-based)</p>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. Strategic Objectives</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Content Objective</label>
                                            <select value={strategy.objective} onChange={(e) => setStrategy({...strategy, objective: e.target.value as any})}>
                                                <option value="Awareness">Awareness</option>
                                                <option value="Education">Education</option>
                                                <option value="Promotion">Promotion</option>
                                                <option value="Engagement">Engagement</option>
                                                <option value="Social Proof">Social Proof</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Target Format</label>
                                            <select value={strategy.format} onChange={(e) => setStrategy({...strategy, format: e.target.value as any})}>
                                                <option value="Short Caption">Short Caption</option>
                                                <option value="Long Caption">Long Caption</option>
                                                <option value="Carousel">Carousel</option>
                                                <option value="Video Script">Video / Reels Caption</option>
                                                <option value="Announcement">Announcement</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Contextual Focus</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Product Focus</label>
                                            <input type="text" value={strategy.focus} onChange={(e) => setStrategy({...strategy, focus: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Special Occasion</label>
                                            <select value={strategy.occasion} onChange={(e) => setStrategy({...strategy, occasion: e.target.value as any})}>
                                                <option value="None">None</option>
                                                <option value="Public Holiday">Public Holiday</option>
                                                <option value="Industry Event">Industry Event</option>
                                                <option value="Company Milestone">Company Milestone</option>
                                                <option value="Campaign Period">Campaign Period</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-primary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. Strategic Overrides & CTA</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Language Override</label>
                                            <select value={strategy.overrideLanguage} onChange={(e) => setStrategy({...strategy, overrideLanguage: e.target.value as any})}>
                                                <option value="No Override">None</option>
                                                <option value="English">English</option>
                                                <option value="Vietnamese">Vietnamese</option>
                                                <option value="Bilingual">Bilingual</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>CTA Intent</label>
                                            <select value={strategy.ctaIntent} onChange={(e) => setStrategy({...strategy, ctaIntent: e.target.value as any})}>
                                                <option value="Soft (Learn more)">Soft</option>
                                                <option value="Medium (Try it out)">Medium</option>
                                                <option value="Hard (Book a demo)">Hard</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Target URL</label>
                                            <input type="url" value={strategy.overrideCTAUrl} onChange={(e) => setStrategy({...strategy, overrideCTAUrl: e.target.value})} />
                                        </div>
                                    </div>
                                    <button className="add-contact-button" onClick={handleSaveAgent} style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                                        <Icon name="check" /> Save Agent Config
                                    </button>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="settings-section">
                            <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                                <h2 style={{ color: 'var(--brand-primary)', margin: 0, fontSize: '1.75rem' }}>System Configuration</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Global application preferences and platform maintenance.</p>
                            </header>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
                                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Localization</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>System Interface Language</label>
                                            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                                                <option value="en">English (Global)</option>
                                                <option value="vi">Tiếng Việt (Vietnamese)</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Timezone</label>
                                            <select value={system.timezone} onChange={(e) => setSystem({...system, timezone: e.target.value})}>
                                                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Date Format</label>
                                            <select value={system.dateFormat} onChange={(e) => setSystem({...system, dateFormat: e.target.value as any})}>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Options</h4>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Business Name (Branding)</label>
                                            <input type="text" value={system.businessName} onChange={(e) => setSystem({...system, businessName: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Default Currency</label>
                                            <select value={system.currency} onChange={(e) => setSystem({...system, currency: e.target.value})}>
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="VND">VND - Vietnam Dong</option>
                                                <option value="EUR">EUR - Euro</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--brand-accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maintenance & Data</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
                                            Managing your local environment. These actions only affect this browser session.
                                        </p>
                                        <button className="generic-button" onClick={handleSaveSystem} style={{ width: '100%', marginBottom: '1rem' }}>
                                            Update System Preferences
                                        </button>
                                        <button className="delete-button" onClick={handleResetApp} style={{ width: '100%', border: '1px solid #E53E3E', borderRadius: '8px' }}>
                                            <Icon name="trash" /> Reset Application Data
                                        </button>
                                    </div>

                                    <div style={{ background: 'rgba(0, 163, 160, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--brand-accent)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--brand-primary)', fontSize: '0.9rem' }}>System Health</h4>
                                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.85rem', color: '#555' }}>
                                            <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>AI Connection:</span> <span style={{ color: 'var(--brand-accent)', fontWeight: 700 }}>Active</span>
                                            </li>
                                            <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>API Key Status:</span> <span style={{ color: 'var(--brand-accent)', fontWeight: 700 }}>Verified</span>
                                            </li>
                                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Data Privacy:</span> <span style={{ fontWeight: 600 }}>Local Encryption</span>
                                            </li>
                                        </ul>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        socialPages.length > 0 ? (
                            <div>
                                <button className="generic-button" style={{ marginBottom: '0.5rem', marginTop: '1rem', marginLeft: 'auto' }} onClick={() => redirectApp('facebook')}>Add Connector</button>
                                <div className="integrations-grid">
                                {socialPages.map(page => (
                                    <div key={page.id} className="integration-card">
                                        <div className="integration-icon">
                                            <Icon name={page.platform} />
                                        </div>
                                        <div className="integration-details">
                                            <h4><a href={`https://${page.platform}.com/${page.pageId}`} target="_blank" rel="noopener noreferrer">{page.name}</a></h4>
                                            <p>{page.pageId}</p>
                                            <p>{page.tokenExpiresAt}</p>
                                        </div>
                                        <div className="integration-actions">
                                            <div className="btn-group" role="group" aria-label="Basic checkbox toggle button group">
                                                <button className="delete-button" style={{ width: '100%', border: '1px solid #E53E3E', borderRadius: '8px' }} onClick={() => handleDeleteSocialPage(page.id)}><Icon name="trash" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ) : 
                            (
                            <div className="placeholder-view">
                                <Icon name="settings" style={{ width: 48, height: 48, stroke: '#ccc', marginBottom: '1rem' }} />
                                <h2>Integrations Settings</h2>
                                <p>Configure third-party connectors (Zapier, n8n, Slack) to expand your workflow.</p>
                                <button className="generic-button" style={{ marginTop: '1rem' }} onClick={() => redirectApp('facebook')}>Add Connector</button>
                            </div>
                        )
                        
                    )}
                </div>
            </div>
        </div>
        )}
        </>
    );
};
