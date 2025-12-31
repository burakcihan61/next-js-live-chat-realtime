'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HistoryItem {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string;
    visitorName: string;
    visitorEmail: string;
    agentName: string;
    rating?: number;
}

interface Message {
    id: string;
    content: string;
    senderType: 'agent' | 'visitor' | 'system';
    createdAt: string;
    type: string;
    attachments?: any[];
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                search: search
            });
            const res = await fetch(`/api/conversations/history?${params}`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchHistory();
        }, 300);
        return () => clearTimeout(timeout);
    }, [page, search]);

    const handleViewDetails = async (id: string) => {
        if (selectedConversation === id) {
            setSelectedConversation(null); // Toggle off
            return;
        }

        setSelectedConversation(id);
        setMessagesLoading(true);
        try {
            const res = await fetch(`/api/messages?conversationId=${id}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMessagesLoading(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Konuşma Geçmişi</h1>
                    <p className="text-sm text-gray-500">Tamamlanan görüşmeleri inceleyin</p>
                </div>
                <div className="w-64">
                    <input
                        type="text"
                        placeholder="İsim veya E-posta ara..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* List */}
                <div className={`flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Ziyaretçi</th>
                                    <th className="px-6 py-3">Temsilci</th>
                                    <th className="px-6 py-3">Tarih</th>
                                    <th className="px-6 py-3">Süre</th>
                                    <th className="px-6 py-3">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading && history.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center">Yükleniyor...</td></tr>
                                ) : history.map((item) => {
                                    const duration = item.endedAt && item.startedAt
                                        ? Math.round((new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime()) / 1000 / 60)
                                        : 0;

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-gray-50 cursor-pointer ${selectedConversation === item.id ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleViewDetails(item.id)}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div>{item.visitorName || 'İsimsiz'}</div>
                                                <div className="text-xs text-gray-500">{item.visitorEmail}</div>
                                            </td>
                                            <td className="px-6 py-4">{item.agentName || '-'}</td>
                                            <td className="px-6 py-4">
                                                {item.endedAt && format(new Date(item.endedAt), 'd MMM yyyy HH:mm', { locale: tr })}
                                            </td>
                                            <td className="px-6 py-4">{duration} dk</td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                    İncele
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loading && history.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                        >
                            Önceki
                        </button>
                        <span className="text-sm text-gray-600">Sayfa {page} / {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                        >
                            Sonraki
                        </button>
                    </div>
                </div>

                {/* Detail View (Side Panel) */}
                {selectedConversation && (
                    <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Konuşma Detayı</h3>
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {messagesLoading ? (
                                <div className="flex justify-center p-8"><span className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></span></div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.senderType === 'agent'
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : msg.senderType === 'system'
                                                        ? 'bg-gray-200 text-gray-600 text-xs text-center w-full'
                                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                                }`}>
                                                {msg.type === 'image' && msg.attachments ? (
                                                    <div className="space-y-2">
                                                        {msg.attachments.map((att: any, i: number) => (
                                                            <img key={i} src={att.url} className="max-w-full h-auto rounded-lg" alt="Attachment" />
                                                        ))}
                                                        {msg.content && <p className="mt-1">{msg.content}</p>}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                )}
                                                {msg.senderType !== 'system' && (
                                                    <span className={`text-[10px] block mt-1 ${msg.senderType === 'agent' ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && <p className="text-center text-gray-500 text-sm">Mesaj yok.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
