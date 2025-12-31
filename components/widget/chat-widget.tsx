'use client';

import { useState, useEffect } from 'react';
import { useVisitorSession } from '@/hooks/use-visitor-session';
import { useMessages } from '@/hooks/use-messages';
import { useRealtime } from '@/hooks/use-realtime';
import { useTypingStore } from '@/stores/use-typing-store';
import { useUIStore } from '@/stores/use-ui-store';
import { WidgetButton } from './widget-button';
import { WidgetHeader } from './widget-header';
import { WidgetMessages } from './widget-messages';
import { WidgetInput } from './widget-input';
import { PreChatForm } from './pre-chat-form';
import { RatingView } from './rating-view';
import { OfflineForm } from './offline-form';

export function ChatWidget() {
    const [visitorName, setVisitorName] = useState('');
    const [visitorEmail, setVisitorEmail] = useState('');
    const [hasSubmittedInfo, setHasSubmittedInfo] = useState(false);
    const [conversationStatus, setConversationStatus] = useState<string | null>(null);
    const [hasRated, setHasRated] = useState(false);
    const [isOnline, setIsOnline] = useState(true); // Default online to avoid flash

    const { isWidgetOpen, isWidgetMinimized, toggleWidget, toggleWidgetMinimize, setWidgetOpen } = useUIStore();
    const { visitorId, conversationId, isLoading, createConversation } = useVisitorSession();
    const { messages, isLoading: messagesLoading, sendMessage } = useMessages(conversationId || '');
    const { isTyping } = useTypingStore();
    const isAgentTyping = conversationId ? isTyping(conversationId) : false;


    // Subscribe to real-time updates
    useRealtime(conversationId);

    // Initial checks
    useEffect(() => {
        // Check online status
        fetch('/api/widget/status')
            .then(res => res.json())
            .then(data => setIsOnline(data.isOnline))
            .catch(() => setIsOnline(false));

        // Check local storage for visitor info
        const storedName = localStorage.getItem('chat-visitor-name');
        const storedEmail = localStorage.getItem('chat-visitor-email');
        if (storedName) { // Only check for name, email might be optional
            setVisitorName(storedName);
            setVisitorEmail(storedEmail || '');
            setHasSubmittedInfo(true);
        }
    }, [conversationId]); // Added conversationId to dependencies to re-check if conversation changes

    // Fetch conversation status
    useEffect(() => {
        const fetchConversationStatus = async () => {
            if (!conversationId) return;

            try {
                const response = await fetch(`/api/conversations/${conversationId}`);
                const data = await response.json();
                if (data.success) {
                    setConversationStatus(data.data.status);
                }
            } catch (error) {
                console.error('Error fetching conversation status:', error);
            }
        };

        fetchConversationStatus();
    }, [conversationId, messages]); // Re-check when messages change (conversation might be closed)

    const handlePreChatSubmit = async (data: { name: string; email: string; department?: string }) => {
        setVisitorName(data.name);
        setVisitorEmail(data.email);
        setHasSubmittedInfo(true);

        // Save to localStorage
        localStorage.setItem('chat-visitor-name', data.name);
        if (data.email) {
            localStorage.setItem('chat-visitor-email', data.email);
        }

        // Update visitor info
        if (visitorId) {
            await fetch(`/api/visitors/${visitorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: data.name, email: data.email }),
            });
        }

        // Create conversation if doesn't exist
        if (!conversationId) {
            await createConversation({
                tags: data.department ? [`departman:${data.department}`] : []
            });
        }
    };

    const handleOfflineSubmit = async (data: { name: string; email: string; message: string }) => {
        // Save info
        localStorage.setItem('chat-visitor-name', data.name);
        localStorage.setItem('chat-visitor-email', data.email);
        setVisitorName(data.name);
        setVisitorEmail(data.email);
        setHasSubmittedInfo(true);

        // Create offline conversation
        const conv = await createConversation({
            subject: 'Offline Message',
            tags: ['offline']
        });

        if (conv && visitorId) {
            // Send the message immediately
            await sendMessage(data.message, visitorId, 'visitor');
            // Show success or switch to message view (which will show the sent message)
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!visitorId || !conversationId) return;
        await sendMessage(content, visitorId, 'visitor');
    };

    if (!isWidgetOpen) {
        return (
            <button
                onClick={toggleWidget}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg text-white flex items-center justify-center hover:scale-110 transition-transform z-50"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Status Indicator */}
                <span className={`absolute top-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl z-50 flex flex-col transition-all duration-300 ${isWidgetMinimized ? 'w-72 h-14' : 'w-[380px] h-[600px]'}`}>
            <WidgetHeader
                onClose={() => setWidgetOpen(false)}
                onMinimize={toggleWidgetMinimize}
                isOnline={isOnline}
                conversationId={conversationId}
                visitorId={visitorId || undefined}
            />

            {!isWidgetMinimized && (
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600">Yükleniyor...</p>
                            </div>
                        </div>
                    ) : !hasSubmittedInfo ? (
                        <PreChatForm onSubmit={handlePreChatSubmit} />
                    ) : (
                        <>
                            <WidgetMessages messages={messages} isTyping={isAgentTyping} />
                            {conversationStatus === 'closed' || conversationStatus === 'resolved' ? (
                                !hasRated ? (
                                    <div className="absolute inset-0 z-10 bg-white">
                                        <RatingView
                                            conversationId={conversationId}
                                            onRateSubmit={() => setHasRated(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50 text-center rounded-b-2xl">
                                        <p className="text-sm text-gray-600 mb-3">
                                            Bu konuşma sonlandırılmıştır.
                                        </p>
                                        <button
                                            onClick={() => {
                                                // Session bilgilerini temizle ama isim/email kalsın
                                                localStorage.removeItem('visitor-session-id');
                                                localStorage.removeItem('visitor-id');
                                                // Sayfayı yenile ve yeni session başlat
                                                window.location.reload();
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                            Yeni Konuşma Başlat
                                        </button>
                                    </div>
                                )
                            ) : (
                                <WidgetInput
                                    onSend={handleSendMessage}
                                    onSendFile={async (content, type, attachments) => {
                                        if (!visitorId || !conversationId) return;
                                        await sendMessage(content, visitorId, 'visitor', type, attachments);
                                    }}
                                    visitorId={visitorId || ''}
                                    visitorName={visitorName}
                                    conversationId={conversationId}
                                    disabled={!conversationId}
                                />
                            )}
                        </>
                    )}

                </div>
            )
            }

            {
                isWidgetOpen && isWidgetMinimized && (
                    <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300">
                        <WidgetHeader
                            onClose={() => setWidgetOpen(false)}
                            onMinimize={toggleWidgetMinimize}
                            isOnline={isOnline}
                            conversationId={conversationId}
                            visitorId={visitorId || undefined}
                        />
                    </div>
                )
            }
        </div>
    );
}
