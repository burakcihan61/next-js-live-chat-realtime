'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseTypingProps {
    conversationId: string | null;
    userId: string;
    userName: string;
    userType: 'agent' | 'visitor';
}

export function useTyping({ conversationId, userId, userName, userType }: UseTypingProps) {
    const isTypingRef = useRef(false);

    const sendTypingIndicator = async (isTyping: boolean) => {
        if (!conversationId) return;

        try {
            await fetch('/api/typing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    userId,
                    userName,
                    userType,
                    isTyping,
                }),
            });
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    };

    const stopTyping = useDebouncedCallback(() => {
        if (isTypingRef.current) {
            sendTypingIndicator(false);
            isTypingRef.current = false;
        }
    }, 3000);

    const startTyping = useCallback(() => {
        if (!isTypingRef.current) {
            sendTypingIndicator(true);
            isTypingRef.current = true;
        }
        stopTyping();
    }, [conversationId]);

    useEffect(() => {
        return () => {
            if (isTypingRef.current) {
                sendTypingIndicator(false);
            }
        };
    }, [conversationId]);

    return { startTyping };
}
