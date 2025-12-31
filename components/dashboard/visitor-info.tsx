'use client';

import { useConversationStore } from '@/stores/use-conversation-store';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { EndConversationButton } from '@/components/shared/end-conversation-button';
import { PriorityButton } from './priority-button';
import { ConversationActions } from './conversation-actions';
import { useEffect, useState } from 'react';
import { ConversationWithRelations } from '@/types';

interface VisitorInfoProps {
    currentUserId?: string;
}

export function VisitorInfo({ currentUserId }: VisitorInfoProps) {
    const { selectedConversationId, conversations } = useConversationStore();
    const [conversationData, setConversationData] = useState<ConversationWithRelations | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch fresh conversation data when selection changes
    useEffect(() => {
        if (!selectedConversationId) {
            setConversationData(null);
            return;
        }

        const fetchConversationData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/conversations/${selectedConversationId}`);
                const data = await response.json();

                if (data.success) {
                    setConversationData(data.data);
                }
            } catch (error) {
                console.error('Error fetching conversation:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversationData();
    }, [selectedConversationId]);

    // Use fetched data or fallback to store data
    const selectedConversation = conversationData || conversations.find(
        (c) => c.id === selectedConversationId
    );

    if (isLoading) {
        return (
            <div className="w-80 border-l border-gray-200 bg-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!selectedConversation || !selectedConversation.visitor) {
        return (
            <div className="w-80 border-l border-gray-200 bg-white p-6">
                <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm">Ziyaretçi bilgisi yok</p>
                </div>
            </div>
        );
    }

    const visitor = selectedConversation.visitor;
    const isClosed = selectedConversation.status === 'closed' || selectedConversation.status === 'resolved';

    return (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ziyaretçi Bilgileri</h3>
                </div>

                {/* Priority and End Conversation */}
                <div className="flex items-center gap-2">
                    <PriorityButton
                        conversationId={selectedConversation.id}
                        currentPriority={(selectedConversation.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium'}
                    />
                    {!isClosed && (
                        <EndConversationButton
                            conversationId={selectedConversation.id}
                            isVisitor={false}
                        />
                    )}
                </div>
                {/* Agent Actions */}
                {!isClosed && currentUserId && (
                    <ConversationActions
                        conversation={selectedConversation}
                        currentUserId={currentUserId}
                    />
                )}
            </div>

            {/* Scrollable Content Section */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Avatar & Name */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-3">
                        {visitor.name ? visitor.name[0].toUpperCase() : 'Z'}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                        {visitor.name || 'İsimsiz Ziyaretçi'}
                    </h4>
                    {visitor.email && (
                        <a href={`mailto:${visitor.email}`} className="text-sm text-blue-600 hover:underline mt-1 block">
                            {visitor.email}
                        </a>
                    )}
                </div>

                {/* Session Info */}
                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Session ID</span>
                        </div>
                        <p className="text-sm text-gray-900 font-mono break-all">
                            {visitor.sessionId}
                        </p>
                    </div>

                    {/* IP Address */}
                    {visitor.ipAddress && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600">IP Address</span>
                            </div>
                            <p className="text-sm text-gray-900">
                                {visitor.ipAddress}
                            </p>
                        </div>
                    )}

                    {/* Location */}
                    {visitor.location && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600">Location</span>
                            </div>
                            <p className="text-sm text-gray-900">
                                {typeof visitor.location === 'object'
                                    ? `${visitor.location.city}, ${visitor.location.region}, ${visitor.location.country}`
                                    : visitor.location}
                            </p>
                        </div>
                    )}

                    {/* Browser */}
                    {visitor.userAgent && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600">Browser</span>
                            </div>
                            <p className="text-sm text-gray-900 break-all">
                                {visitor.userAgent}
                            </p>
                        </div>
                    )}
                </div>

                {/* Activity */}
                <div className="space-y-4">
                    {/* First Visit */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">First Visit</span>
                        </div>
                        <p className="text-sm text-gray-900">
                            {formatDistanceToNow(new Date(visitor.createdAt), {
                                addSuffix: true,
                                locale: tr,
                            })}
                        </p>
                    </div>

                    {/* Last Activity */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Last Activity</span>
                        </div>
                        <p className="text-sm text-gray-900">
                            {formatDistanceToNow(new Date(visitor.lastSeenAt || visitor.createdAt), {
                                addSuffix: true,
                                locale: tr,
                            })}
                        </p>
                    </div>

                    {/* Conversation Started */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Conversation Started</span>
                        </div>
                        <p className="text-sm text-gray-900">
                            {formatDistanceToNow(new Date(selectedConversation.startedAt), {
                                addSuffix: true,
                                locale: tr,
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
