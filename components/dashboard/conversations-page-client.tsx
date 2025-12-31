'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useConversations } from '@/hooks/use-conversations';
import { useConversationStore } from '@/stores/use-conversation-store';
import { ConversationList } from '@/components/dashboard/conversation-list';
import { ChatWindow } from '@/components/dashboard/chat-window';

interface ConversationsPageProps {
    session: {
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
}

export default function ConversationsPageClient({ session }: ConversationsPageProps) {
    const { isLoading } = useConversations();
    const { selectedConversationId } = useConversationStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Konuşmalar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Konuşmalar</h1>
                        <p className="text-sm text-gray-600">Aktif ve bekleyen konuşmaları yönetin</p>
                    </div>
                    <div className="flex items-center gap-4">

                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-96 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <input
                            type="search"
                            placeholder="Konuşma ara..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <ConversationList currentUserId={session.user.id} />
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 overflow-hidden">
                    <ChatWindow
                        conversationId={selectedConversationId}
                        userId={session.user.id}
                        userName={session.user.name}
                    />
                </div>
            </div>
        </div>
    );
}
