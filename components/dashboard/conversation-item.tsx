'use client';

import { useConversationStore } from '@/stores/use-conversation-store';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ConversationItemProps {
    conversationId: string;
    visitorName?: string;
    lastMessage?: string;
    lastMessageAt: Date;
    status: string;
    unreadCount?: number;
    onClick: () => void;
    isSelected: boolean;
    isLocked?: boolean;
}

export function ConversationItem({
    conversationId,
    visitorName,
    lastMessage,
    lastMessageAt,
    status,
    unreadCount = 0,
    onClick,
    isSelected,
    isLocked,
}: ConversationItemProps) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        resolved: 'bg-blue-100 text-blue-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.pending;

    return (
        <div
            onClick={onClick}
            className={`p-4 border-b border-gray-200 cursor-pointer transition hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {visitorName ? visitorName[0].toUpperCase() : 'Z'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {isLocked && (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )}
                            <h3 className="font-semibold text-gray-900">
                                {visitorName || 'Ziyaretçi'}
                            </h3>
                            {/* Priority Badge */}
                            {(() => {
                                const priorityColors = {
                                    low: 'bg-gray-100 text-gray-600',
                                    medium: 'bg-blue-100 text-blue-600',
                                    high: 'bg-orange-100 text-orange-600',
                                    urgent: 'bg-red-100 text-red-600',
                                };
                                const priorityIcons = {
                                    low: '↓',
                                    medium: '→',
                                    high: '↑',
                                    urgent: '⚠',
                                };
                                const priority = (status as any) || 'medium';
                                return null; // Priority will be shown in detail view
                            })()}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                            {status === 'pending' && 'Bekliyor'}
                            {status === 'active' && 'Aktif'}
                            {status === 'resolved' && 'Çözüldü'}
                            {status === 'closed' && 'Kapalı'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(lastMessageAt), { addSuffix: true, locale: tr })}
                    </p>
                    {unreadCount > 0 && (
                        <span className="inline-block mt-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
            {lastMessage && (
                <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
            )}
        </div>
    );
}
