'use client';

import { useState } from 'react';

interface RatingViewProps {
    conversationId: string;
    onRateSubmit: () => void;
}

export function RatingView({ conversationId, onRateSubmit }: RatingViewProps) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await fetch(`/api/conversations/${conversationId}/rate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, feedback }),
            });
            setIsSubmitted(true);
            setTimeout(() => {
                onRateSubmit();
            }, 2000);
        } catch (error) {
            console.error('Rating submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Teşekkürler!</h3>
                <p className="text-gray-600">Geri bildiriminiz alındı.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white h-full flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hizmetimizi Puanlayın</h3>
            <p className="text-sm text-gray-600 mb-6">
                Yaptığımız görüşmeden ne kadar memnun kaldınız?
            </p>

            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <svg
                                className={`w-8 h-8 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={rating >= star ? 0 : 2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Görüşleriniz (İsteğe bağlı)..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-24"
                    />
                </div>

                <button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
            </form>
        </div>
    );
}
