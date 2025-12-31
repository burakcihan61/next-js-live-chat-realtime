'use client';

import { useEffect, useState } from 'react';
import { useMessageStore } from '@/stores/use-message-store';

export function useMessages(conversationId: string | null) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setMessages, getMessages } = useMessageStore();

    const messages = conversationId ? getMessages(conversationId) : [];

    const fetchMessages = async () => {
        if (!conversationId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/messages?conversationId=${conversationId}`);
            const data = await response.json();

            if (data.success) {
                setMessages(conversationId, data.data);
            } else {
                setError(data.error || 'Failed to fetch messages');
            }
        } catch (err) {
            setError('An error occurred while fetching messages');
            console.error('Fetch messages error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (
        content: string,
        senderId: string,
        senderType: 'agent' | 'visitor',
        type: 'text' | 'image' | 'file' = 'text',
        attachments: any[] = []
    ) => {
        if (!conversationId) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content,
                    senderId,
                    senderType,
                    type,
                    attachments
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to send message');
            }

            return data.data;
        } catch (err) {
            console.error('Send message error:', err);
            throw err;
        }
    };

    useEffect(() => {
        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        refetch: fetchMessages,
    };
}
