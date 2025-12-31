'use client';

import { useState, useRef } from 'react';
import { useTyping } from '@/hooks/use-typing';


interface WidgetInputProps {
    onSend: (content: string) => Promise<void>;
    onSendFile?: (content: string, type: 'image' | 'file', attachments: any[]) => Promise<void>;
    visitorId: string;
    visitorName: string;
    conversationId: string | null;
    disabled?: boolean;
}

export function WidgetInput({ onSend, onSendFile, visitorId, visitorName, conversationId, disabled }: WidgetInputProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startTyping } = useTyping({
        conversationId,
        userId: visitorId,
        userName: visitorName,
        userType: 'visitor',
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input immediately
        e.target.value = '';

        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success && onSendFile) {
                await onSendFile(
                    'Resim gönderildi',
                    'image',
                    [{
                        url: data.data.url,
                        name: data.data.name,
                        type: data.data.type,
                        size: data.data.size
                    }]
                );
            }
        } catch (error) {
            console.error('File upload error:', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isSending || disabled) return;

        setIsSending(true);
        try {
            await onSend(message.trim());
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        startTyping();
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white rounded-b-2xl">
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={disabled || isSending}
            />
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                    title="Resim Ekle"
                >
                    {isUploading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    placeholder="Mesajınızı yazın..."
                    disabled={disabled || isSending}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <button
                    type="submit"
                    disabled={!message.trim() || isSending || disabled}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Send message"
                >
                    {isSending ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </div>
        </form>
    );
}
