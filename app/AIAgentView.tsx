import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icon } from '../components/atoms/Icon/icons';

// Define the structure of a message
interface Message {
    id: number;
    text: string;
    sender: 'ai' | 'user';
    attachment?: string | null; // Optional base64 string for images
}

export const AIAgentView = () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const initialMessage: Message = { 
        id: 1, 
        text: "Hello! I'm Kai, your AI-powered workflow assistant. How can I help you today? You can ask me to draft social posts, generate images, or manage your contacts.", 
        sender: 'ai' 
    };

    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = () => {
        setFilePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if ((input.trim() === '' && !filePreview) || isLoading) return;

        const userPrompt = input;
        const userAttachment = filePreview;

        const newUserMessage: Message = { 
            id: Date.now(), 
            text: userPrompt, 
            sender: 'user', 
            attachment: userAttachment 
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        
        setInput('');
        removeAttachment();
        setIsLoading(true);

        try {
            const isImageGenerationRequest = /^(generate|create|draw|make|imagine) an? (image|picture|photo|logo|icon|drawing)/i.test(userPrompt);

            if (isImageGenerationRequest && !userAttachment) {
                // Text-to-Image Generation
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: userPrompt,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/jpeg',
                    },
                });
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

                const aiResponse: Message = {
                    id: Date.now() + 1,
                    text: `Here's the image I created for you.`,
                    sender: 'ai',
                    attachment: imageUrl,
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                // Chat or Vision (text + image)
                const model = 'gemini-2.5-flash';
                const parts: any[] = [];

                if (userPrompt) {
                    parts.push({ text: userPrompt });
                }
                if (userAttachment) {
                    const [header, data] = userAttachment.split(',');
                    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
                    parts.push({
                        inlineData: {
                            mimeType,
                            data
                        }
                    });
                }
                
                if (parts.length > 0) {
                     const response = await ai.models.generateContent({
                        model,
                        contents: { parts: parts },
                    });
                    const aiResponse: Message = {
                        id: Date.now() + 1,
                        text: response.text,
                        sender: 'ai',
                        attachment: null,
                    };
                    setMessages(prev => [...prev, aiResponse]);
                }
            }
        } catch (error) {
            console.error("Error communicating with AI:", error);
            const errorResponse: Message = {
                id: Date.now() + 1,
                text: "I'm sorry, but I encountered an issue while processing your request. Please try again later.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDownload = () => {
        const conversation = messages.map(msg => {
            return `[${new Date(msg.id).toLocaleString()}] ${msg.sender.toUpperCase()}:\n${msg.text}\n${msg.attachment ? '[Attachment: Image]' : ''}`;
        }).join('\n\n');
        
        const blob = new Blob([conversation], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcatalk-conversation-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNewChat = () => {
        if (window.confirm('Are you sure you want to start a new chat? The current conversation will be cleared.')) {
            setMessages([initialMessage]);
            setIsHistoryOpen(false);
        }
    };

    return (
        <>
            <header className="chat-header">
                <span>AI Agent: Kai</span>
                <div className="header-actions">
                    <button className="icon-button" title="Download Conversation" onClick={handleDownload}><Icon name="download" /></button>
                    <button className="icon-button" title="Conversation History" onClick={() => setIsHistoryOpen(true)}><Icon name="history" /></button>
                    <button className="icon-button" title="Start New Chat" onClick={handleNewChat}><Icon name="refresh" /></button>
                </div>
            </header>
            <div className="messages-area">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        {msg.attachment && <img src={msg.attachment} alt="attachment" className="message-attachment" />}
                        {msg.text && <p>{msg.text}</p>}
                    </div>
                ))}
                {isLoading && (
                    <div className="message-bubble ai">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
                {filePreview && (
                    <div className="attachment-preview">
                        <img src={filePreview} alt="Preview" className="preview-image" />
                        <button 
                            className="icon-button" 
                            onClick={removeAttachment}
                            style={{backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%'}}
                            title="Remove attachment"
                        >
                           <Icon name="close" style={{ stroke: '#FFFFFF', strokeWidth: '2.5' }} />
                        </button>
                    </div>
                )}
                <div className="input-wrapper">
                    <button className="icon-button" title="Attach file">
                        <Icon name="attachment" />
                        <input 
                            type="file" 
                            className="hidden-file-input" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </button>
                    <textarea
                        className="chat-input"
                        placeholder="Chat with Kai..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <button className="send-button" onClick={handleSend} disabled={isLoading || (input.trim() === '' && !filePreview)}>
                        <Icon name="send" />
                    </button>
                </div>
            </div>

            <div className={`history-overlay ${isHistoryOpen ? 'open' : ''}`} onClick={() => setIsHistoryOpen(false)}></div>
            <div className={`history-drawer ${isHistoryOpen ? 'open' : ''}`}>
                <div className="history-drawer-header">
                    <span>Conversation History</span>
                    <button className="icon-button" onClick={() => setIsHistoryOpen(false)}><Icon name="close" /></button>
                </div>
                <div className="history-list">
                    {/* Mock History Items */}
                    <div className="history-item">
                        <h4>Social Post Draft - Real Estate</h4>
                        <p>October 26, 2023</p>
                    </div>
                    <div className="history-item">
                        <h4>CRM Insight Query</h4>
                        <p>October 25, 2023</p>
                    </div>
                    <div className="history-item">
                        <h4>Generate Image for Blog</h4>
                        <p>October 24, 2023</p>
                    </div>
                     <div className="history-item">
                        <h4>Follow-up Email to Client</h4>
                        <p>October 22, 2023</p>
                    </div>
                </div>
            </div>
        </>
    );
};