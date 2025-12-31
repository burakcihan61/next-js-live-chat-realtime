'use client';

import { ConversationWithRelations } from '@/types';
import { useMessages } from '@/hooks/use-messages';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useEffect } from 'react';

interface HistoryDetailModalProps {
    conversation: ConversationWithRelations;
    onClose: () => void;
}

export function HistoryDetailModal({ conversation, onClose }: HistoryDetailModalProps) {
    const { messages } = useMessages(conversation.id);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Konuşma Detayı</h2>
                                <p className="text-blue-100 mt-1">
                                    {conversation.visitor?.name || 'İsimsiz Ziyaretçi'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 hover:bg-white/20 rounded-lg transition flex items-center justify-center"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Visitor Info */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-900 mb-4">Ziyaretçi Bilgileri</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">İsim</p>
                                    <p className="font-medium">{conversation.visitor?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{conversation.visitor?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Başlangıç</p>
                                    <p className="font-medium">
                                        {format(new Date(conversation.startedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Bitiş</p>
                                    <p className="font-medium">
                                        {conversation.endedAt
                                            ? format(new Date(conversation.endedAt), 'dd MMMM yyyy HH:mm', { locale: tr })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Mesajlar ({messages.length})</h3>
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${message.senderType === 'agent'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${message.senderType === 'agent' ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {format(new Date(message.createdAt), 'HH:mm', { locale: tr })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
