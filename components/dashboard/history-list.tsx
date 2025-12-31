'use client';

import { ConversationWithRelations } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { HistoryDetailModal } from './history-detail-modal';

interface HistoryListProps {
    conversations: ConversationWithRelations[];
    isLoading: boolean;
}

export function HistoryList({ conversations, isLoading }: HistoryListProps) {
    const [selectedConversation, setSelectedConversation] = useState<ConversationWithRelations | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p className="text-sm">Geçmiş konuşma bulunamadı</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ziyaretçi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Başlangıç
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bitiş
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Süre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlem
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {conversations.map((conversation) => {
                            const duration = conversation.endedAt && conversation.startedAt
                                ? Math.round((new Date(conversation.endedAt).getTime() - new Date(conversation.startedAt).getTime()) / 60000)
                                : 0;

                            return (
                                <tr key={conversation.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {conversation.visitor?.name?.[0]?.toUpperCase() || 'Z'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {conversation.visitor?.name || 'İsimsiz Ziyaretçi'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {conversation.visitor?.email || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${conversation.status === 'resolved'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {conversation.status === 'resolved' ? 'Çözüldü' : 'Kapalı'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(conversation.startedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {conversation.endedAt
                                            ? format(new Date(conversation.endedAt), 'dd MMM yyyy HH:mm', { locale: tr })
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {duration > 0 ? `${duration} dk` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => setSelectedConversation(conversation)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Detay
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedConversation && (
                <HistoryDetailModal
                    conversation={selectedConversation}
                    onClose={() => setSelectedConversation(null)}
                />
            )}
        </>
    );
}
