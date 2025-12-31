'use client';

import { useState, useEffect } from 'react';
import { ConversationWithRelations } from '@/types';

interface UseHistoryOptions {
    status?: 'closed' | 'resolved' | 'all';
    search?: string;
    startDate?: string;
    endDate?: string;
}

export function useHistory(options: UseHistoryOptions = {}) {
    const [conversations, setConversations] = useState<ConversationWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.status && options.status !== 'all') {
                params.append('status', options.status);
            }
            if (options.search) {
                params.append('search', options.search);
            }
            if (options.startDate) {
                params.append('startDate', options.startDate);
            }
            if (options.endDate) {
                params.append('endDate', options.endDate);
            }

            const response = await fetch(`/api/conversations/history?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setConversations(data.data);
            } else {
                setError(data.error || 'Failed to fetch history');
            }
        } catch (err) {
            setError('An error occurred while fetching history');
            console.error('Fetch history error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [options.status, options.search, options.startDate, options.endDate]);

    return {
        conversations,
        isLoading,
        error,
        refetch: fetchHistory,
    };
}
