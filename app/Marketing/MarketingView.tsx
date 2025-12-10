import React, { useState } from 'react';
import { ConversationsView } from './ConversationsView';
import { CampaignsView } from './CampaignsView';
import { AnalyticsView } from './AnalyticsView';

export const MarketingView = () => {
    const [activeTab, setActiveTab] = useState<'conversations' | 'campaigns' | 'analytics'>('conversations');
    
    const renderContent = () => {
        switch (activeTab) {
            case 'conversations':
                return <ConversationsView />;
            case 'campaigns':
                return <CampaignsView />;
            case 'analytics':
                return <AnalyticsView />;
            default:
                return null;
        }
    };

    return (
        <div className="marketing-container">
            <div className="marketing-tabs">
                <div className={`marketing-tab ${activeTab === 'conversations' ? 'active' : ''}`} onClick={() => setActiveTab('conversations')}>Conversations</div>
                <div className={`marketing-tab ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>Campaigns</div>
                <div className={`marketing-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
            </div>
            <div className="marketing-content">
                {renderContent()}
            </div>
        </div>
    );
};