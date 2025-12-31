'use client';

import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher/client';
import { useConversationStore } from '@/stores/use-conversation-store';
import { useMessageStore } from '@/stores/use-message-store';
import { useTypingStore } from '@/stores/use-typing-store';
import { Message, Conversation } from '@/types';

export function useRealtime(conversationId: string | null) {
    const channelRef = useRef<any>(null);
    const { addConversation, updateConversation } = useConversationStore();
    const { addMessage } = useMessageStore();
    const { setTyping, removeTyping } = useTypingStore();

    useEffect(() => {
        // Subscribe to global conversations channel
        const conversationsChannel = pusherClient.subscribe('conversations');

        conversationsChannel.bind('new-conversation', (data: { conversation: Conversation }) => {
            addConversation(data.conversation as any);
        });

        conversationsChannel.bind('conversation-assigned', (data: { conversation: Conversation }) => {
            updateConversation(data.conversation.id, data.conversation);
        });

        return () => {
            conversationsChannel.unbind_all();
            pusherClient.unsubscribe('conversations');
        };
    }, []);

    useEffect(() => {
        if (!conversationId) {
            if (channelRef.current) {
                channelRef.current.unbind_all();
                pusherClient.unsubscribe(`private-conversation-${conversationId}`);
                channelRef.current = null;
            }
            return;
        }

        // Subscribe to specific conversation channel
        const channel = pusherClient.subscribe(`private-conversation-${conversationId}`);
        channelRef.current = channel;

        channel.bind('new-message', (data: { message: Message }) => {
            addMessage(conversationId, data.message);
        });

        channel.bind('conversation-updated', (data: { conversation: Conversation }) => {
            updateConversation(conversationId, data.conversation);
        });

        channel.bind('conversation-closed', (data: { conversation: Conversation }) => {
            updateConversation(conversationId, data.conversation);
        });

        channel.bind('user-typing', (data: { userId: string; userName: string; userType: 'agent' | 'visitor'; timestamp: number }) => {
            setTyping(conversationId, {
                userId: data.userId,
                userName: data.userName,
                userType: data.userType,
                timestamp: data.timestamp,
            });
        });

        channel.bind('user-stopped-typing', (data: { userId: string }) => {
            removeTyping(conversationId, data.userId);
        });

        // Listen for conversation ended event
        channel.bind('conversation-ended', (data: { conversationId: string; endedBy: string; message: string }) => {
            console.log('🚪 [Realtime] Conversation ended:', data);

            // Only clear session if ended by admin (not by visitor themselves)
            if (data.endedBy === 'admin') {
                // Clear all session data
                localStorage.clear();
                sessionStorage.clear();

                // Show alert to user
                alert(data.message || 'Konuşma sonlandırıldı');

                // Reload page to reset session
                window.location.reload();
            }
        });

        return () => {
            if (channelRef.current) {
                channelRef.current.unbind_all();
                pusherClient.unsubscribe(`private-conversation-${conversationId}`);
                channelRef.current = null;
            }
        };
    }, [conversationId]);
}
