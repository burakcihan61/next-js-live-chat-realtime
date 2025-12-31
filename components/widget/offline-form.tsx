'use client';

import { useState } from 'react';

interface OfflineFormProps {
    onSubmit: (data: { name: string; email: string; message: string }) => void;
}

export function OfflineForm({ onSubmit }: OfflineFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim() && message.trim()) {
            onSubmit({
                name: name.trim(),
                email: email.trim(),
                message: message.trim()
            });
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-4 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Şu an çevrimdışıyız 🌙</h2>
                <p className="text-xs text-gray-600 mt-1">
                    Mesajınızı bırakın, size e-posta ile dönüş yapalım.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
                <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                        İsim *
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="Adınız Soyadınız"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="Size ulaşabileceğimiz email"
                    />
                </div>

                <div className="flex-1">
                    <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
                        Mesajınız *
                    </label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="w-full h-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                        placeholder="Konu hakkında bilgi verin..."
                        style={{ minHeight: '80px' }}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                    Mesajı Gönder
                </button>
            </form>
        </div>
    );
}
