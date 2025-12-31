'use client';

import { useConversationStore } from '@/stores/use-conversation-store';
import { ConversationItem } from './conversation-item';

export function ConversationList({ currentUserId }: { currentUserId?: string }) {
    const { conversations, selectedConversationId, selectConversation, claimConversation } = useConversationStore();

    const handleSelect = async (id: string) => {
        selectConversation(id);

        // Try to claim the conversation
        const result = await claimConversation(id);

        if (!result.success && result.error === 'Conversation already assigned') {
            // Import toast store dynamically
            const { toast } = await import('@/stores/use-toast-store');
            const assignedTo = result.assignedTo?.name || 'başka bir temsilci';
            toast.warning(`Bu konuşma ${assignedTo} tarafından yürütülüyor.`);
        }
    };

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Henüz konuşma yok</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full">
            {conversations.filter(c => c && c.id).map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversationId={conversation.id}
                    visitorName={conversation.visitor?.name || undefined}
                    lastMessage={conversation.messages?.[conversation.messages.length - 1]?.content || undefined}
                    lastMessageAt={conversation.lastMessageAt}
                    status={conversation.status}
                    unreadCount={0} // TODO: Calculate from messages
                    onClick={() => handleSelect(conversation.id)}
                    isSelected={selectedConversationId === conversation.id}
                />
            ))}
        </div>
    );
}
