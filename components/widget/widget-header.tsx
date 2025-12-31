'use client';

import { useState } from 'react';
interface WidgetHeaderProps {
    onClose: () => void;
    onMinimize: () => void;
    isOnline?: boolean;
    conversationId?: string | null;
    visitorId?: string;
}

export function WidgetHeader({
    onClose,
    onMinimize,
    isOnline = true,
    conversationId,
    visitorId,
}: WidgetHeaderProps) {
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    const handleCloseClick = () => {
        if (conversationId) {
            setShowCloseConfirm(true);
        } else {
            onClose();
        }
    };

    const handleEndConversation = async () => {
        setIsEnding(true);
        try {
            const response = await fetch('/api/conversations/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    visitorId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Clear visitor session
                localStorage.removeItem('chat-visitor-name');
                localStorage.removeItem('chat-visitor-email');
                localStorage.removeItem('visitor-session-id');
                // Reload to reset state/session
                window.location.reload();
            } else {
                console.error('Failed to end conversation:', data.error);
                onClose(); // Fallback to just closing
            }
        } catch (error) {
            console.error('Error ending conversation:', error);
            onClose();
        } finally {
            setIsEnding(false);
            setShowCloseConfirm(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold">Canlı Destek</h3>
                        <div className="flex items-center gap-1 text-xs">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            <span>{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Minimize Button */}
                    <button
                        onClick={onMinimize}
                        className="w-8 h-8 hover:bg-white/20 rounded-lg transition flex items-center justify-center"
                        aria-label="Minimize"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    {/* Close Button */}
                    <button
                        onClick={handleCloseClick}
                        className="w-8 h-8 hover:bg-white/20 rounded-lg transition flex items-center justify-center"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Close Confirmation Modal */}
            {showCloseConfirm && (
                <div className="absolute top-full left-0 right-0 bg-white p-4 shadow-xl z-50 rounded-b-2xl border-t border-gray-100 text-gray-800">
                    <p className="font-medium mb-3 text-sm">Ne yapmak istersiniz?</p>
                    <div className="space-y-2">
                        <button
                            onClick={handleEndConversation}
                            disabled={isEnding}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                            {isEnding ? (
                                <span className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            Konuşmayı Sonlandır
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
                        >
                            Sadece Pencereyi Kapat
                        </button>
                        <button
                            onClick={() => setShowCloseConfirm(false)}
                            className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 text-xs transition"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
