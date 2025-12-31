'use client';

import { useState } from 'react';

interface PreChatFormProps {
    onSubmit: (data: { name: string; email: string; department?: string }) => void;
}

export function PreChatForm({ onSubmit }: PreChatFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit({
                name: name.trim(),
                email: email.trim(),
                department: department || undefined
            });
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Merhaba! 👋</h2>
                <p className="text-sm text-gray-600 mt-2">
                    Size nasıl yardımcı olabiliriz? Lütfen bilgilerinizi girin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        İsim *
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Adınız Soyadınız"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Opsiyonel)
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="ornek@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Departman (İsteğe Bağlı)
                    </label>
                    <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    >
                        <option value="">Seçiniz...</option>
                        <option value="Satış">Satış</option>
                        <option value="Teknik Destek">Teknik Destek</option>
                        <option value="Muhasebe">Muhasebe</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                    Sohbete Başla
                </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
                Mesajlarınız güvenli bir şekilde iletilir
            </p>
        </div >
    );
}
