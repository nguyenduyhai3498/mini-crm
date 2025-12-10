import React, { useState } from 'react';
import { Icon } from '../../components/atoms/Icon/icons';

// --- MOCK DATA & INTERFACES ---
type CampaignStatus = 'Active' | 'Draft' | 'Completed';
type CampaignType = 'Email' | 'SMS' | 'Social';

interface Campaign {
    id: number;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    startDate: string;
    contacts: number;
    openRate?: number; // Optional for non-email campaigns
    content: {
        subject?: string;
        body: string;
        imageUrl?: string;
    };
}

const mockCampaigns: Campaign[] = [
    { id: 1, name: 'Q4 Nurture Series', type: 'Email', status: 'Active', startDate: '2023-10-15', contacts: 1250, openRate: 78, content: { subject: 'Boosting Your Q4 Performance', body: 'Hi [FirstName],\n\nAs we head into the final quarter, let\'s make sure you have all the tools you need for success. We\'ve curated a list of resources to help you meet your goals...\n\nBest,\nThe OrcaFlow Team' } },
    { id: 2, name: 'New Feature: AI Planner', type: 'Social', status: 'Completed', startDate: '2023-09-01', contacts: 5400, content: { body: 'Introducing the AI-powered content planner in OrcaFlow! 🚀 Plan, generate, and schedule your social media posts all in one place. Say goodbye to content bottlenecks and hello to streamlined creativity. #AI #MarketingAutomation #SaaS', imageUrl: 'https://placeholder.pics/svg/800x400/00A3A0-FFFFFF/New%20Feature!' } },
    { id: 3, name: '2024 Event Follow-ups', type: 'Email', status: 'Draft', startDate: '2024-01-20', contacts: 0, openRate: 0, content: { subject: 'Following up from Innovation Summit 2024', body: 'Hi [FirstName],\n\nIt was great connecting with you at the Innovation Summit. I\'d love to schedule a brief call to discuss how OrcaFlow can help [Company] achieve its automation goals this year.' } },
    { id: 4, name: 'Holiday Promo SMS', type: 'SMS', status: 'Completed', startDate: '2023-11-20', contacts: 850, content: { body: 'OrcaFlow Flash Sale! Get 30% off all annual plans this week only. Reply STOP to unsubscribe.' } },
];


export const CampaignsView = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(campaigns.length > 0 ? campaigns[0] : null);
    
    return (
         <div className="campaigns-view">
            <div className="campaigns-list-panel">
                 <div className="campaign-list-header contact-header-top-row">
                    <h3 style={{ margin: 0, color: 'var(--brand-primary)' }}>All Campaigns</h3>
                    <button className="add-contact-button">
                        <Icon name="plus" />
                        New
                    </button>
                </div>
                <div className="campaign-list">
                    {campaigns.map(c => (
                        <div key={c.id} className={`campaign-list-item ${selectedCampaign?.id === c.id ? 'active' : ''}`} onClick={() => setSelectedCampaign(c)}>
                            <p className="contact-name">{c.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
                                <span className="contact-company">{c.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="campaign-detail-view">
                {selectedCampaign ? (
                    <div>
                        <div className="detail-section">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                 <h4>{selectedCampaign.name}</h4>
                                 <div>
                                     <button className="generic-button" disabled={selectedCampaign.status !== 'Draft'}>Edit</button>
                                     <button className="delete-button" disabled={selectedCampaign.status !== 'Draft'} style={{marginLeft: '0.5rem'}}>Delete</button>
                                 </div>
                            </div>
                           
                            <div className="info-pair"><span>Status</span><span className={`status-badge ${selectedCampaign.status.toLowerCase()}`}>{selectedCampaign.status}</span></div>
                            <div className="info-pair"><span>Type</span><span>{selectedCampaign.type}</span></div>
                            <div className="info-pair"><span>Contacts</span><span>{selectedCampaign.contacts.toLocaleString()}</span></div>
                        </div>
                        <div className="detail-section">
                            <h4>Content</h4>
                            {selectedCampaign.content.subject && <p><strong>Subject: </strong>{selectedCampaign.content.subject}</p>}
                            <div className="campaign-content-preview">
                                {selectedCampaign.content.body}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder-view"><h2>No Campaign Selected</h2></div>
                )}
            </div>
        </div>
    )
}