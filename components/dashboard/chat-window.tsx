'use client';

import { useMessages } from '@/hooks/use-messages';
import { useRealtime } from '@/hooks/use-realtime';
import { useTypingStore } from '@/stores/use-typing-store';
import { useConversationStore } from '@/stores/use-conversation-store';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { VisitorInfo } from './visitor-info';

interface ChatWindowProps {
    conversationId: string | null;
    userId: string;
    userName: string;
}

export function ChatWindow({ conversationId, userId, userName }: ChatWindowProps) {
    const { messages, sendMessage } = useMessages(conversationId);
    const { isTyping } = useTypingStore();
    const { conversations } = useConversationStore();

    // Subscribe to real-time updates
    useRealtime(conversationId);

    // Get conversation status
    const conversation = conversations.find(c => c.id === conversationId);
    const isClosed = conversation?.status === 'closed' || conversation?.status === 'resolved';

    // Check if locked (assigned to another agent)
    const isLocked = conversation?.assignedAgentId && conversation.assignedAgentId !== userId;
    const assignedAgentName = conversation?.assignedAgent?.name || 'Başka bir temsilci';

    const handleSendMessage = async (content: string) => {
        if (!conversationId || isClosed || isLocked) return;
        await sendMessage(content, userId, 'agent');
    };

    if (!conversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
                <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">Bir konuşma seçin</p>
                <p className="text-sm mt-2">Mesajlaşmaya başlamak için soldaki listeden bir konuşma seçin</p>
            </div>
        );
    }

    const isVisitorTyping = conversationId ? isTyping(conversationId) : false;

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col bg-white">
                <MessageList messages={messages} isTyping={isVisitorTyping} />

                {/* Locked Banner */}
                {isLocked && (
                    <div className="bg-yellow-50 border-t border-yellow-100 p-4 flex items-center justify-center text-yellow-800 gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-sm font-medium">
                            Bu konuşma {assignedAgentName} tarafından yürütülüyor. Sadece izleyebilirsiniz.
                        </p>
                    </div>
                )}

                {isClosed ? (
                    <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
                        <p className="text-sm text-gray-600">
                            Bu konuşma sonlandırılmıştır. Yeni mesaj gönderilemez.
                        </p>
                    </div>
                ) : (
                    <MessageInput
                        onSend={handleSendMessage}
                        onSendFile={async (content, type, attachments) => {
                            if (!conversationId) return;
                            await sendMessage(content, userId, 'agent', type, attachments);
                        }}
                        userId={userId}
                        userName={userName}
                        conversationId={conversationId}
                        disabled={!!isLocked}
                    />
                )}
            </div>
            <VisitorInfo currentUserId={userId} />
        </div>
    );
}
