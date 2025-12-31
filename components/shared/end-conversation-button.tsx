'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EndConversationButtonProps {
    conversationId: string;
    isVisitor?: boolean;
    visitorId?: string;
    onEnd?: () => void;
}

export function EndConversationButton({
    conversationId,
    isVisitor = false,
    visitorId,
    onEnd
}: EndConversationButtonProps) {
    const [isEnding, setIsEnding] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleEndConversation = async () => {
        setIsEnding(true);
        try {
            const response = await fetch('/api/conversations/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    visitorId: isVisitor ? visitorId : undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Ziyaretçi ise localStorage ve session'ı tamamen temizle
                if (isVisitor) {
                    // Tüm session bilgilerini temizle
                    localStorage.removeItem('chat-visitor-name');
                    localStorage.removeItem('chat-visitor-email');
                    localStorage.removeItem('visitor-session-id');
                    localStorage.removeItem('visitor-id');

                    // Yeni session için sayfayı yenile
                    // Bu sayede yeni bir session ID oluşturulacak
                    window.location.reload();
                } else {
                    onEnd?.();
                    router.refresh();
                }
            } else {
                alert('Konuşma sonlandırılamadı: ' + data.error);
            }
        } catch (error) {
            console.error('End conversation error:', error);
            alert('Bir hata oluştu');
        } finally {
            setIsEnding(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isEnding}
                title="Konuşmayı Sonlandır"
                className="flex items-center justify-center p-2 bg-white text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed group relative"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    Konuşmayı Sonlandır
                </span>
            </button>

            {showConfirm && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setShowConfirm(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 max-w-md w-full z-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Konuşmayı Sonlandır
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {isVisitor
                                ? 'Konuşmayı sonlandırmak istediğinizden emin misiniz? Tüm oturum bilgileriniz silinecektir.'
                                : 'Bu konuşmayı sonlandırmak istediğinizden emin misiniz?'}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleEndConversation}
                                disabled={isEnding}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                            >
                                {isEnding ? 'Sonlandırılıyor...' : 'Evet, Sonlandır'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
