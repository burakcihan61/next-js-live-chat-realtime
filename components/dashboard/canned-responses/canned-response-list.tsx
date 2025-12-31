'use client';

import { useState, useEffect } from 'react';
import { useCannedResponseStore } from '@/stores/use-canned-response-store';


interface CannedResponseListProps {
    currentUserRole?: string;
    currentUserId?: string;
}

export function CannedResponseList({ currentUserRole, currentUserId }: CannedResponseListProps) {
    const { responses, fetchResponses, addResponse, deleteResponse } = useCannedResponseStore();
    const [isOpen, setIsOpen] = useState(false);
    const [shortcut, setShortcut] = useState('');
    const [content, setContent] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchResponses();
        }
    }, [isOpen, fetchResponses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addResponse(shortcut, content, isGlobal);
        if (success) {
            setShortcut('');
            setContent('');
            setIsGlobal(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu hazır cevabı silmek istediğinize emin misiniz?')) {
            await deleteResponse(id);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Hazır Cevaplar"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Hazır Cevaplar</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <form onSubmit={handleSubmit} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="/kısayol (örn: merhaba)"
                                            value={shortcut}
                                            onChange={(e) => setShortcut(e.target.value.replace(/^\//, ''))}
                                            className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mesaj içeriği..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    {currentUserRole === 'admin' && (
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={isGlobal}
                                                onChange={(e) => setIsGlobal(e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Herkese açık (Global)
                                        </label>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Ekle
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {responses.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Henüz hazır cevap eklenmemiş.</p>
                            ) : (
                                responses.map((response) => (
                                    <div key={response.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 transition group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    /{response.shortcut}
                                                </span>
                                                {response.userId === null && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                                        GLOBAL
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-800">{response.content}</p>
                                        </div>
                                        {(currentUserRole === 'admin' || response.userId === currentUserId) && (
                                            <button
                                                onClick={() => handleDelete(response.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
