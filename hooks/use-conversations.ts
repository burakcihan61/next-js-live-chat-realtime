'use client';

import { useEffect, useState } from 'react';
import { useConversationStore } from '@/stores/use-conversation-store';
import { ConversationWithRelations } from '@/types';

export function useConversations() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setConversations } = useConversationStore();

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/conversations');
            const data = await response.json();

            if (data.success) {
                setConversations(data.data);
            } else {
                setError(data.error || 'Failed to fetch conversations');
            }
        } catch (err) {
            setError('An error occurred while fetching conversations');
            console.error('Fetch conversations error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    return {
        isLoading,
        error,
        refetch: fetchConversations,
    };
}
