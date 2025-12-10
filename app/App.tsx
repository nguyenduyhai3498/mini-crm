import React, { useState } from 'react';
import '../styles/global.css'; // Import global styles
import { AIAgentView } from './AIAgentView';
import { PlannerView } from './PlannerView';
import { ContactsView } from './ContactsView';
import { MarketingView } from './Marketing/MarketingView';
import { LoginView } from './LoginView';
import { Icon } from '../components/atoms/Icon/icons'; // Import new Icon component
import { useAuth } from '../hooks/useAuth';

export const App = () => {
    const [activeTab, setActiveTab] = useState('marketing');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    const toggleSidebar = () => {
        if (window.innerWidth > 768) {
            setIsSidebarCollapsed(prev => !prev);
        }
    };

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="auth-loading-container">
                <div className="auth-loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang kiểm tra xác thực...</p>
                </div>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return <LoginView />;
    }

    const navItems = [
        { key: 'chat', label: 'AI Agent', iconName: 'chat' },
        { key: 'planner', label: 'Planner', iconName: 'planner' },
        { key: 'contacts', label: 'Contacts', iconName: 'contacts' },
        { key: 'marketing', label: 'Marketing', iconName: 'marketing' },
        { key: 'settings', label: 'Settings', iconName: 'settings' },
    ];

    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            await logout();
        }
    };
    
    const PlaceholderView = ({ title }: { title: string }) => (
        <div className="placeholder-view">
            <h2>{title}</h2>
            <p>This feature is under construction.</p>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return <AIAgentView />; // No more `icons` prop
            case 'planner':
                return <PlannerView />;
            case 'contacts':
                return <ContactsView />;
            case 'marketing':
                return <MarketingView />;
            default:
                return <PlaceholderView title={navItems.find(item => item.key === activeTab)?.label || 'Page'} />;
        }
    };

    return (
        <>
            <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <nav className="sidebar">
                    <div className="sidebar-header">
                        {isSidebarCollapsed ? <Icon name="logoMark" /> : <Icon name="logo" />}
                    </div>
                    <ul className="nav-list">
                        {navItems.map(item => (
                            <li 
                                key={item.key} 
                                className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.key)}
                                title={isSidebarCollapsed ? item.label : ''}
                            >
                                <Icon name={item.iconName} />
                                <span className="nav-item-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="sidebar-footer">
                        <div className="user-info">
                            <div className="user-avatar">
                                <Icon name="user" />
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="user-details">
                                    <span className="user-name">{user.name}</span>
                                </div>
                            )}
                            <button 
                                className="logout-button" 
                                onClick={handleLogout}
                                title="Đăng xuất"
                            >
                                <Icon name="logOut" />
                            </button>
                        </div>
                        <button 
                            className="sidebar-toggle-button" 
                            onClick={toggleSidebar} 
                            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Icon name="sidebarToggle" />
                        </button>
                    </div>
                </nav>
                <main className="main-content">
                    {renderContent()}
                </main>
            </div>
        </>
    );
};