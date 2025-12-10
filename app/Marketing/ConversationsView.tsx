import React, { useState } from 'react';
import { Icon } from '../../components/atoms/Icon/icons';

// --- MOCK DATA & INTERFACES ---
interface Message {
    id: number;
    sender: 'agent' | 'contact';
    text: string;
    timestamp: string; // ISO String
}

interface Conversation {
    id: number;
    campaignName: string;
    contactName: string;
    subject: string;
    isRead: boolean;
    isStarred: boolean;
    messages: Message[];
}

const mockConversations: Conversation[] = [
    { 
        id: 1, 
        campaignName: 'Q4 Nurture Series', 
        contactName: 'Alice Johnson', 
        subject: 'Re: Following up on our Q4 goals', 
        isRead: false, 
        isStarred: true,
        messages: [
            { id: 1, sender: 'contact', text: 'Thanks for the resources, this is really helpful!', timestamp: '2023-10-27T10:00:00Z' },
            { id: 2, sender: 'contact', text: 'Could we schedule a demo for the new analytics feature?', timestamp: '2023-10-27T10:01:00Z' },
            { id: 3, sender: 'agent', text: 'Absolutely, Alice! I\'d be happy to set that up. Does next Tuesday at 2 PM work for you?', timestamp: '2023-10-27T10:05:00Z' },
        ]
    },
    { 
        id: 2, 
        campaignName: 'New Feature: AI Planner', 
        contactName: 'Charlie Brown', 
        subject: 'Social Media Comment', 
        isRead: false, 
        isStarred: false,
        messages: [
            { id: 1, sender: 'contact', text: 'This new feature is a total game-changer for my team!', timestamp: '2023-10-26T14:30:00Z' },
            { id: 2, sender: 'agent', text: 'That\'s fantastic to hear, Charlie! We\'re so glad you\'re finding it useful. Let us know if you have any feedback.', timestamp: '2023-10-26T14:32:00Z' },
        ]
    },
    { 
        id: 3, 
        campaignName: 'Q4 Nurture Series', 
        contactName: 'Diana Miller', 
        subject: 'Quick Question', 
        isRead: true, 
        isStarred: false,
        messages: [
             { id: 1, sender: 'contact', text: 'That sounds great, let\'s schedule a call for next week.', timestamp: '2023-10-24T09:15:00Z' },
        ]
    },
];

export const ConversationsView = () => {
    const [conversations, setConversations] = useState(mockConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(() => {
        return window.innerWidth > 768 ? conversations[0]?.id || null : null;
    });
    const [isMobileDetailView, setIsMobileDetailView] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        if (window.innerWidth <= 768) {
            setIsMobileDetailView(true);
        }
        // Mark as read on selection
        setConversations(convos => convos.map(c => c.id === id ? { ...c, isRead: true } : c));
    };
    
    return (
        <div className={`conversations-container ${isMobileDetailView ? 'mobile-detail-view' : ''}`}>
            <div className="conversation-list-panel">
                <div className="conversation-list-header">
                    <div className="inbox-header-controls">
                        <div className="search-bar">
                            <Icon name="search" />
                            <input type="text" placeholder="Search inbox..." />
                        </div>
                         <button className="icon-button" title="Filter conversations" onClick={() => setShowFilters(prev => !prev)}>
                            <Icon name="filter" />
                        </button>
                    </div>
                    {showFilters && (
                        <div className="inbox-filters">
                            <div className="filter-group">
                                <label>Status</label>
                                <div className="filter-options">
                                    <button className="filter-button active">All</button>
                                    <button className="filter-button">Unread</button>
                                    <button className="filter-button">Read</button>
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Channel</label>
                                <div className="filter-options">
                                    <button className="filter-button active">All</button>
                                    <button className="filter-button">Email</button>
                                    <button className="filter-button">SMS</button>
                                    <button className="filter-button">Facebook</button>
                                    <button className="filter-button">Instagram</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="conversation-list">
                    {conversations.map(convo => {
                        const lastMessage = convo.messages[convo.messages.length - 1];
                        return (
                            <div 
                                key={convo.id} 
                                className={`conversation-list-item ${selectedConversationId === convo.id ? 'active' : ''} ${!convo.isRead ? 'unread' : ''}`}
                                onClick={() => handleSelectConversation(convo.id)}
                            >
                                <div className="conversation-name-date-row">
                                    <span className="conversation-contact-name">{convo.contactName}</span>
                                    <span className="conversation-date">{new Date(lastMessage.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="conversation-subject">{convo.subject}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="conversation-detail-panel">
                {selectedConversation ? (
                    <>
                        <div className="conversation-detail-header">
                            <button className="back-button icon-button" onClick={() => setIsMobileDetailView(false)} title="Back to list">
                                <Icon name="chevronLeft" />
                            </button>
                            <div className="conversation-header-info">
                                <h4>{selectedConversation.contactName}</h4>
                                <p>Re: {selectedConversation.subject}</p>
                            </div>
                            <div className="conversation-detail-actions">
                                <button className="icon-button" title="Archive"><Icon name="archive" /></button>
                                <button className="icon-button" title="Star"><Icon name="star" /></button>
                                <button className="icon-button" title="More options"><Icon name="moreVertical" /></button>
                            </div>
                        </div>
                        <div className="conversation-thread">
                            {selectedConversation.messages.map(msg => (
                                <div key={msg.id} className={`message-thread-bubble ${msg.sender}`}>
                                    <p style={{margin: 0}}>{msg.text}</p>
                                    <p className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                                </div>
                            ))}
                        </div>
                        <div className="reply-area">
                            <div className="input-wrapper">
                                <textarea className="chat-input" placeholder={`Reply to ${selectedConversation.contactName}...`} rows={1}></textarea>
                                <button className="send-button">
                                    <Icon name="send" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                     <div className="placeholder-view"><h2>Select a conversation</h2><p>Choose a conversation from the list to see the full thread.</p></div>
                )}
            </div>
        </div>
    );
};