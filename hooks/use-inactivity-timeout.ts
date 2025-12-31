'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
    timeout?: number; // in milliseconds
    onTimeout: () => void;
    enabled?: boolean;
}

export function useInactivityTimeout({
    timeout = 5 * 60 * 1000, // 5 minutes default
    onTimeout,
    enabled = true,
}: UseInactivityTimeoutOptions) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const resetTimer = useCallback(() => {
        if (!enabled) return;

        lastActivityRef.current = Date.now();

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            console.log('⏱️ [Inactivity] Session timeout - logging out');
            onTimeout();
        }, timeout);
    }, [timeout, onTimeout, enabled]);

    useEffect(() => {
        if (!enabled) return;

        // Activity events to monitor
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        // Debounced activity handler
        let debounceTimer: NodeJS.Timeout;
        const handleActivity = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                resetTimer();
            }, 500); // Debounce 500ms
        };

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            clearTimeout(debounceTimer);
        };
    }, [resetTimer, enabled]);

    return {
        resetTimer,
        lastActivity: lastActivityRef.current,
    };
}
