import React, { useState, useMemo } from 'react';
import { Icon } from '../components/atoms/Icon/icons';

// --- CONTACTS MOCK DATA & INTERFACES ---
type ContactStatus = 'Lead' | 'Customer' | 'Partner' | 'Archived';
const ALL_STATUSES: ContactStatus[] = ['Lead', 'Customer', 'Partner', 'Archived'];

interface CustomField {
    id: number;
    key: string;
    value: string;
}

type HistoryEventType = 'Creation' | 'Email' | 'Social' | 'Note' | 'Call';
interface HistoryEvent {
    id: number;
    type: HistoryEventType;
    date: string; // ISO string
    details: string; // Summary
    fullContent?: { // Optional detailed content
        subject?: string;
        body?: string;
        imageUrl?: string;
    };
}

interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    status: ContactStatus;
    notes: string;
    customFields?: CustomField[];
    history?: HistoryEvent[];
}

const initialMockContacts: Contact[] = [
    { 
        id: 1, 
        firstName: 'Alice', 
        lastName: 'Johnson', 
        email: 'alice.j@examplecorp.com', 
        phone: '555-0101', 
        company: 'ExampleCorp', 
        role: 'Project Manager', 
        status: 'Customer', 
        notes: 'Main point of contact for the "Omega" project. Prefers communication via email.', 
        customFields: [{ id: 1, key: 'Source', value: 'LinkedIn' }],
        history: [
            { id: 1, type: 'Creation', date: '2023-08-15T10:00:00Z', details: 'Contact added via web form.' },
            { 
                id: 2, 
                type: 'Email', 
                date: '2023-09-01T14:30:00Z', 
                details: 'Email sent: Initial project proposal.',
                fullContent: {
                    subject: 'Initial Project Proposal for Omega Project',
                    body: 'Hi Alice,\n\nPlease find the attached project proposal for the upcoming Omega Project. We are excited about the possibility of working with ExampleCorp and believe our solution is a perfect fit for your needs.\n\nLooking forward to hearing your thoughts.\n\nBest regards,\nOrcaFlow Team'
                }
            },
            { 
                id: 3, 
                type: 'Social', 
                date: '2023-09-20T12:00:00Z', 
                details: 'Scheduled post mentioning contact on LinkedIn.',
                fullContent: {
                    body: 'Thrilled to be kicking off a new project with the talented team at ExampleCorp, including Alice Johnson! #ProjectOmega #Collaboration',
                    imageUrl: 'https://placeholder.pics/svg/800x400/00A3A0-FFFFFF/Collaboration'
                }
            },
            { 
                id: 4, 
                type: 'Note', 
                date: '2023-10-05T11:00:00Z', 
                details: 'Added note about project preferences.',
                fullContent: {
                    body: 'During our call, Alice mentioned a strong preference for bi-weekly check-ins instead of weekly ones. She also wants all design mockups delivered as Figma links.'
                }
            }
        ]
    },
    { id: 2, firstName: 'Bob', lastName: 'Williams', email: 'bob.w@innovatech.io', phone: '555-0102', company: 'Innovatech', role: 'Lead Developer', status: 'Partner', notes: 'Technical lead for the API integration. Very responsive.', customFields: [], history: [
        { id: 1, type: 'Creation', date: '2023-07-22T09:00:00Z', details: 'Contact imported from spreadsheet.' },
        { id: 2, type: 'Call', date: '2023-08-10T16:00:00Z', details: 'Phone call to discuss API integration details.' },
    ] },
    { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@startupz.com', phone: '555-0103', company: 'StartupZ', role: 'CEO', status: 'Lead', notes: 'Met at the Tech Conference last month. Follow up regarding a potential demo.', customFields: [], history: [
        { id: 1, type: 'Creation', date: new Date().toISOString(), details: 'Contact added at Tech Conference.' },
    ] },
    { id: 4, firstName: 'Diana', lastName: 'Miller', email: 'diana.m@solutions.co', phone: '555-0104', company: 'Solutions Co.', role: 'Marketing Director', status: 'Customer', notes: '', customFields: [{ id: 2, key: 'Region', value: 'West Coast' }], history: [] },
    { id: 5, firstName: 'Ethan', lastName: 'Davis', email: 'ethan.d@globalnet.com', phone: '555-0105', company: 'GlobalNet', role: 'IT Specialist', status: 'Archived', notes: 'Previous contact, moved to a different company.', customFields: [], history: [] },
];

const ContactModal = ({ contact, onClose, onSave }: { contact: Partial<Contact> | null, onClose: () => void, onSave: (contact: Contact) => void }) => {
    const [formData, setFormData] = useState<Partial<Contact>>(
        contact ? { ...contact, customFields: contact.customFields?.map(f => ({...f})) || [] } : { status: 'Lead', customFields: [] }
    );

    const isFormValid = useMemo(() => {
        if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
            return false;
        }
        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(formData.email);
    }, [formData.firstName, formData.lastName, formData.email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCustomField = () => {
        setFormData(prev => ({
            ...prev,
            customFields: [
                ...(prev.customFields || []),
                { id: Date.now(), key: '', value: '' }
            ]
        }));
    };
    
    const handleCustomFieldChange = (id: number, field: 'key' | 'value', value: string) => {
        const updatedFields = formData.customFields?.map(f => 
            f.id === id ? { ...f, [field]: value } : f
        ) || [];
        setFormData(prev => ({ ...prev, customFields: updatedFields }));
    };

    const handleRemoveCustomField = (id: number) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields?.filter(field => field.id !== id)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return; // Guard against submission if button is somehow enabled
        onSave(formData as Contact);
    };

    return (
        <div className="post-detail-modal-overlay" onClick={onClose}>
            <form className="post-detail-modal contact-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="modal-header">
                    <h3>{formData.id ? 'Edit Contact' : 'Add New Contact'}</h3>
                    <button type="button" className="icon-button" onClick={onClose} title="Close">
                        <Icon name="close" />
                    </button>
                </div>
                <div className="modal-content">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                        </div>
                         <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select id="status" name="status" value={formData.status || 'Lead'} onChange={handleChange}>
                                {ALL_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="notes">Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4}></textarea>
                        </div>
                         <div className="form-group full-width custom-fields-section">
                            <label>Custom Fields</label>
                            {formData.customFields?.map((field) => (
                                <div key={field.id} className="custom-field-row">
                                    <input type="text" placeholder="Field Name (e.g., Source)" value={field.key} onChange={(e) => handleCustomFieldChange(field.id, 'key', e.target.value)} />
                                    <input type="text" placeholder="Value (e.g., LinkedIn)" value={field.value} onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)} />
                                    <button type="button" className="icon-button" title="Remove field" onClick={() => handleRemoveCustomField(field.id)}>
                                        <Icon name="trash" style={{ stroke: '#E53E3E' }} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="add-custom-field-button" onClick={handleAddCustomField}>
                                <Icon name="plus" />
                                Add Custom Field
                            </button>
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" className="generic-button" onClick={onClose}>Cancel</button>
                    <button type="submit" className="add-contact-button" disabled={!isFormValid}>Save Contact</button>
                </div>
            </form>
        </div>
    );
};

const HistoryDetailModal = ({ event, onClose }: { event: HistoryEvent, onClose: () => void }) => {
    const getTitle = () => {
        switch (event.type) {
            case 'Email': return 'Email Details';
            case 'Social': return 'Social Post Details';
            case 'Note': return 'Note Details';
            case 'Call': return 'Call Log';
            default: return 'History Event Details';
        }
    };

    const iconMap: { [key in HistoryEventType]: string } = {
        Creation: 'userPlus',
        Email: 'mail',
        Social: 'chat',
        Note: 'fileText',
        Call: 'phone',
    };

    return (
        <div className="post-detail-modal-overlay" onClick={onClose}>
            <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="platform-info">
                        <Icon name={iconMap[event.type]} />
                        <h3>{getTitle()}</h3>
                    </div>
                    <button className="icon-button" onClick={onClose} title="Close">
                        <Icon name="close" />
                    </button>
                </div>
                <div className="modal-content">
                    {event.fullContent?.imageUrl && <img src={event.fullContent.imageUrl} alt="Social post attachment" className="modal-image-preview" />}
                    <h4 className="modal-post-title">{event.fullContent?.subject || event.details}</h4>
                    <p className="modal-post-content">{event.fullContent?.body || 'No additional details available.'}</p>
                    <div className="modal-post-details">
                        <div className="detail-item">
                            <span>Date</span>
                            <strong>{new Date(event.date).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
                 <div className="modal-actions">
                    <button type="button" className="generic-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const CampaignModal = ({ contactCount, onClose, onConfirm }: { contactCount: number, onClose: () => void, onConfirm: (campaignName: string, startDate?: string, startTime?: string) => void }) => {
    const mockCampaigns = ['Q4 Nurture Series', 'New Feature Launch', '2024 Newsletter', 'Event Follow-ups'];
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');

    const handleConfirm = () => {
        if (selectedCampaign) {
            onConfirm(selectedCampaign, startDate, startTime);
        }
    };

    const isScheduled = startDate && (new Date(`${startDate}T${startTime || '00:00'}`) > new Date());
    const buttonText = isScheduled ? 'Schedule Campaign' : 'Run Campaign Now';
    const isButtonDisabled = !selectedCampaign;
    
    return (
        <div className="post-detail-modal-overlay" onClick={onClose}>
            <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add to Campaign</h3>
                    <button className="icon-button" onClick={onClose} title="Close">
                         <Icon name="close" />
                    </button>
                </div>
                <div className="modal-content campaign-modal-content">
                    <p>Select a campaign to add the <strong>{contactCount}</strong> selected contact(s) to.</p>
                    
                    <div className="form-group">
                        <label htmlFor="campaign-select">Campaign</label>
                        <select id="campaign-select" value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
                            <option value="" disabled>Select a campaign...</option>
                            {mockCampaigns.map(campaign => (
                                <option key={campaign} value={campaign}>{campaign}</option>
                            ))}
                        </select>
                    </div>

                    <div className="schedule-fields-grid">
                        <div className="form-group">
                            <label htmlFor="start-date">Start Date</label>
                            <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="start-time">Start Time</label>
                            <input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" className="generic-button" onClick={onClose}>Cancel</button>
                    <button type="button" className="add-contact-button" onClick={handleConfirm} disabled={isButtonDisabled}>
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ContactsView = () => {
    const [contacts, setContacts] = useState<Contact[]>(initialMockContacts);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(() => {
        return window.innerWidth > 768 ? contacts[0] || null : null;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
    const [isMobileDetailView, setIsMobileDetailView] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedContactIds, setSelectedContactIds] = useState<Set<number>>(new Set());
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedHistoryEvent, setSelectedHistoryEvent] = useState<HistoryEvent | null>(null);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

    const iconMap: { [key in HistoryEventType]: string } = {
        Creation: 'userPlus',
        Email: 'mail',
        Social: 'chat',
        Note: 'fileText',
        Call: 'phone',
    };

    const filteredContacts = useMemo(() => {
        return contacts
            .filter(c => {
                if (activeFilter === 'All') return true;
                return c.status === activeFilter;
            })
            .filter(c => {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const customFieldsString = c.customFields?.map(f => `${f.key} ${f.value}`).join(' ').toLowerCase() || '';
                return (
                    `${c.firstName} ${c.lastName}`.toLowerCase().includes(lowerSearchTerm) ||
                    c.company.toLowerCase().includes(lowerSearchTerm) ||
                    c.email.toLowerCase().includes(lowerSearchTerm) ||
                    c.phone.toLowerCase().includes(lowerSearchTerm) ||
                    customFieldsString.includes(lowerSearchTerm)
                );
            });
    }, [contacts, searchTerm, activeFilter]);
    
    const handleSelectionChange = (contactId: number) => {
        const newSelection = new Set(selectedContactIds);
        if (newSelection.has(contactId)) {
            newSelection.delete(contactId);
        } else {
            newSelection.add(contactId);
        }
        setSelectedContactIds(newSelection);
    };

    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            setSelectedContactIds(new Set());
        }
        setIsSelectionMode(!isSelectionMode);
    };

    const handleSaveContact = (contactToSave: Contact) => {
        if (contactToSave.id) {
            const updatedContacts = contacts.map(c => c.id === contactToSave.id ? contactToSave : c);
            setContacts(updatedContacts);
            if (selectedContact?.id === contactToSave.id) {
                setSelectedContact(contactToSave);
            }
        } else {
            const newContact = { ...contactToSave, id: Date.now(), history: [{id: Date.now(), type: 'Creation' as HistoryEvent['type'], date: new Date().toISOString(), details: 'Contact created manually.'}] };
            const updatedContacts = [...contacts, newContact];
            setContacts(updatedContacts);
            setSelectedContact(newContact);
            if (window.innerWidth <= 768) {
                setIsMobileDetailView(true);
            }
        }
        setIsModalOpen(false);
        setEditingContact(null);
    };

    const handleDeleteContact = (contactId: number) => {
        if (window.confirm('Are you sure you want to delete this contact? This action is permanent.')) {
            const updatedContacts = contacts.filter(c => c.id !== contactId);
            setContacts(updatedContacts);
            if (selectedContact?.id === contactId) {
                setSelectedContact(filteredContacts[0] || null);
                if (window.innerWidth <= 768) {
                    setIsMobileDetailView(false);
                }
            }
        }
    };
    
    const handleSelectContact = (contact: Contact) => {
        if (isSelectionMode) {
            handleSelectionChange(contact.id);
        } else {
            setSelectedContact(contact);
            if (window.innerWidth <= 768) {
                setIsMobileDetailView(true);
            }
        }
    };

    const handleAddToCampaign = (campaignName: string, startDate?: string, startTime?: string) => {
        let alertMessage = `Added ${selectedContactIds.size} contacts to "${campaignName}" campaign.`;
        if (startDate) {
            const date = new Date(`${startDate}T${startTime || '00:00'}`);
            alertMessage = `Scheduled ${selectedContactIds.size} contacts to be added to "${campaignName}" on ${date.toLocaleString()}.`;
        }
        alert(alertMessage);
        setIsCampaignModalOpen(false);
        setSelectedContactIds(new Set());
        setIsSelectionMode(false);
    };

    return (
        <div className={`contacts-container ${isMobileDetailView ? 'mobile-detail-view' : ''}`}>
            <div className="contacts-list-panel">
                <div className="contacts-list-header">
                    <div className="contact-header-top-row">
                        <button className="generic-button" onClick={toggleSelectionMode}>
                            {isSelectionMode ? 'Cancel' : 'Select'}
                        </button>
                        <button className="add-contact-button" onClick={() => { setEditingContact({}); setIsModalOpen(true); }}>
                            <Icon name="plus" />
                            Add
                        </button>
                    </div>
                     <div className="search-bar">
                        <Icon name="search" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-tags">
                        <button className={`filter-tag ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
                        {ALL_STATUSES.map(status => (
                            <button key={status} className={`filter-tag ${activeFilter === status ? 'active' : ''}`} onClick={() => setActiveFilter(status)}>{status}</button>
                        ))}
                    </div>
                </div>
                <div className="contacts-list">
                    {filteredContacts.map(contact => (
                        <div
                            key={contact.id}
                            className={`contact-item ${!isSelectionMode && selectedContact?.id === contact.id ? 'active' : ''}`}
                            onClick={() => handleSelectContact(contact)}
                        >
                            {isSelectionMode && (
                                <input
                                    type="checkbox"
                                    className="contact-selection-checkbox"
                                    checked={selectedContactIds.has(contact.id)}
                                    onChange={() => handleSelectionChange(contact.id)}
                                    onClick={(e) => e.stopPropagation()} // Prevent item click when toggling checkbox
                                />
                            )}
                            <div className="contact-info">
                                <span className="contact-name">{contact.firstName} {contact.lastName}</span>
                                <span className="contact-company">{contact.company}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedContactIds.size > 0 && (
                     <div className="floating-action-bar">
                        <span>{selectedContactIds.size} selected</span>
                        <button className="floating-action-bar-button" onClick={() => setIsCampaignModalOpen(true)}>
                            Add to Campaign
                        </button>
                    </div>
                )}
            </div>
            <div className="contact-detail-panel">
                {selectedContact ? (
                    <>
                        <div className="contact-detail-header">
                             <button className="back-button icon-button" onClick={() => setIsMobileDetailView(false)} title="Back to list">
                                <Icon name="chevronLeft" />
                            </button>
                            <div className="contact-header-info">
                                <h2>{selectedContact.firstName} {selectedContact.lastName}</h2>
                                <p>{selectedContact.role} at {selectedContact.company}</p>
                            </div>
                            <div className="contact-header-actions">
                                <span className={`status-badge ${selectedContact.status.toLowerCase()}`}>{selectedContact.status}</span>
                                <button className="icon-button" title="Edit Contact" onClick={() => { setEditingContact(selectedContact); setIsModalOpen(true); }}>
                                    <Icon name="edit" />
                                </button>
                                <button className="icon-button delete-icon-button" title="Delete Contact" onClick={() => handleDeleteContact(selectedContact.id)}>
                                    <Icon name="trash" />
                                </button>
                            </div>
                        </div>
                        <div className="contact-detail-content">
                            <div className="detail-section">
                                <h4>Contact Information</h4>
                                <div className="info-pair">
                                    <span>Email</span>
                                    <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                                </div>
                                <div className="info-pair">
                                    <span>Phone</span>
                                    <span>{selectedContact.phone}</span>
                                </div>
                            </div>
                             {selectedContact.customFields && selectedContact.customFields.length > 0 && (
                                <div className="detail-section">
                                    <h4>Custom Information</h4>
                                    {selectedContact.customFields.map(field => (
                                         field.key && <div key={field.id} className="info-pair">
                                            <span>{field.key}</span>
                                            <span>{field.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="detail-section">
                                <h4>Notes</h4>
                                <p className="notes-content">
                                    {selectedContact.notes || 'No notes for this contact.'}
                                </p>
                            </div>
                            <div className="detail-section">
                                <h4>History</h4>
                                {selectedContact.history && selectedContact.history.length > 0 ? (
                                    <div className="history-timeline">
                                        {selectedContact.history.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(event => (
                                            <div key={event.id} className="history-event" onClick={() => setSelectedHistoryEvent(event)}>
                                                <div className="history-icon-wrapper">
                                                    <Icon name={iconMap[event.type]} />
                                                </div>
                                                <div className="history-content">
                                                    <p className="history-details">{event.details}</p>
                                                    <p className="history-date">
                                                        {new Date(event.date).toLocaleDateString(undefined, {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="notes-content" style={{ color: '#999' }}>No history for this contact yet.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="placeholder-view">
                        <h2>{filteredContacts.length > 0 ? 'Select a contact' : 'No contacts found'}</h2>
                        <p>{filteredContacts.length > 0 ? 'Choose a contact from the list to see their details.' : 'Add a new contact to get started.'}</p>
                    </div>
                )}
            </div>
             {isModalOpen && <ContactModal contact={editingContact} onClose={() => setIsModalOpen(false)} onSave={handleSaveContact} />}
             {selectedHistoryEvent && <HistoryDetailModal event={selectedHistoryEvent} onClose={() => setSelectedHistoryEvent(null)} />}
             {isCampaignModalOpen && <CampaignModal contactCount={selectedContactIds.size} onClose={() => setIsCampaignModalOpen(false)} onConfirm={handleAddToCampaign} />}
        </div>
    );
};