'use client';

import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

export function useVisitorSession() {
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            setIsLoading(true);
            try {
                // Check local storage for existing session
                let currentSessionId = localStorage.getItem('visitor-session-id');

                if (!currentSessionId) {
                    currentSessionId = nanoid();
                }

                const response = await fetch('/api/widget/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: currentSessionId,
                        userAgent: navigator.userAgent,
                        referrer: document.referrer || 'Direct',
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setVisitorId(data.data.visitorId);
                    setSessionId(data.data.sessionId);
                    setConversationId(data.data.conversationId);

                    // Session ID'yi localStorage'a kaydet (sadece referans için)
                    localStorage.setItem('visitor-session-id', data.data.sessionId);
                    localStorage.setItem('visitor-id', data.data.visitorId);
                }
            } catch (error) {
                console.error('Session init error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();
    }, []);

    const createConversation = async (initialData?: { subject?: string; tags?: string[] }) => {
        if (!visitorId) return null;

        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    ...initialData
                }),
            });

            const data = await response.json();

            if (data.success) {
                setConversationId(data.data.id);
                return data.data;
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }

        return null;
    };

    return {
        visitorId,
        sessionId,
        conversationId,
        isLoading,
        createConversation,
    };
}
