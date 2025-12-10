import React from 'react';

interface AnalyticsData {
    overallOpenRate: number;
    overallClickRate: number;
    totalConversions: number;
    topCampaigns: { name: string; value: string }[];
    bottomCampaigns: { name: string; value: string }[];
}


const mockAnalytics: AnalyticsData = {
    overallOpenRate: 68,
    overallClickRate: 19,
    totalConversions: 432,
    topCampaigns: [
        { name: 'Q4 Nurture Series', value: '78% Open Rate' },
        { name: 'New Feature: AI Planner', value: '5.2% Engagement' },
        { name: 'Onboarding Sequence', value: '85% Completion' },
    ],
    bottomCampaigns: [
        { name: 'Old Win-back Email', value: '12% Open Rate' },
        { name: 'July Newsletter', value: '1.1% Click Rate' },
        { name: 'Partner Program Intro', value: '22% Open Rate' },
    ],
};

export const AnalyticsView = () => (
    <div className="analytics-dashboard">
        <div className="metric-card">
            <h4 className="metric-card-title">Overall Open Rate</h4>
            <p className="metric-card-value">{mockAnalytics.overallOpenRate}%</p>
        </div>
        <div className="metric-card">
            <h4 className="metric-card-title">Overall Click Rate</h4>
            <p className="metric-card-value">{mockAnalytics.overallClickRate}%</p>
        </div>
        <div className="metric-card">
            <h4 className="metric-card-title">Total Conversions</h4>
            <p className="metric-card-value">{mockAnalytics.totalConversions}</p>
        </div>
        <div className="metric-card performance-list-card">
            <h4 className="metric-card-title">Top Performing Campaigns</h4>
            <ul className="performance-list">
                {mockAnalytics.topCampaigns.map(c => (
                    <li key={c.name}>
                        <span>{c.name}</span>
                        <span className="value">{c.value}</span>
                    </li>
                ))}
            </ul>
        </div>
         <div className="metric-card performance-list-card">
            <h4 className="metric-card-title">Bottom Performing Campaigns</h4>
            <ul className="performance-list">
                {mockAnalytics.bottomCampaigns.map(c => (
                    <li key={c.name}>
                        <span>{c.name}</span>
                        <span className="value">{c.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);