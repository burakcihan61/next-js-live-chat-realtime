'use client';

import { useState, useEffect, useRef } from 'react';
import { useTyping } from '@/hooks/use-typing';
import { useCannedResponseStore } from '@/stores/use-canned-response-store';
import { CannedResponseList } from './canned-responses/canned-response-list';

interface MessageInputProps {
    onSend: (content: string) => Promise<void>;
    userId: string;
    userName: string;
    conversationId: string | null;
    disabled?: boolean;
    onSendFile?: (content: string, type: 'image' | 'file', attachments: any[]) => Promise<void>;
}

export function MessageInput({ onSend, onSendFile, userId, userName, conversationId, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startTyping } = useTyping({
        conversationId,
        userId,
        userName,
        userType: 'agent',
    });

    // File Upload Logic
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input immediately to allow selecting same file again
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

            if (data.success) {
                // Send message with attachment
                // We need to extend onSend prop to accept type and attachments or handle it here if onSend is limited.
                // Since onSend is passed from ChatWindow -> useMessages hook wrapper, we need to update the prop signature there too.
                // But here, let's assume onSend handles it if we pass it somewhat, OR we assume the parent updates.
                // Actually, `onSend` in props is `(content: string) => Promise<void>`.
                // We need to update `MessageInputProps` first.
                // Assuming we updated `MessageInputProps` below.

                if (onSendFile) {
                    await onSendFile(
                        'Resim gönderildi', // Fallback text content
                        'image',
                        [{
                            url: data.data.url,
                            name: data.data.name,
                            type: data.data.type,
                            size: data.data.size
                        }]
                    );
                }
            }
        } catch (error) {
            console.error('File upload error:', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    // Canned Response Logic
    const { responses, fetchResponses } = useCannedResponseStore();
    const [showCanned, setShowCanned] = useState(false);
    const [filteredResponses, setFilteredResponses] = useState(responses);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        fetchResponses();
    }, []);

    useEffect(() => {
        if (message.startsWith('/')) {
            const query = message.slice(1).toLowerCase();
            const filtered = responses.filter(r =>
                r.shortcut.toLowerCase().startsWith(query) ||
                r.content.toLowerCase().includes(query)
            );
            setFilteredResponses(filtered);
            setShowCanned(filtered.length > 0);
            setSelectedIndex(0);
        } else {
            setShowCanned(false);
        }
    }, [message, responses]);

    const handleCannedSelect = (content: string) => {
        setMessage(content);
        setShowCanned(false);
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showCanned) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResponses.length - 1));
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredResponses.length - 1 ? prev + 1 : 0));
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (filteredResponses[selectedIndex]) {
                    handleCannedSelect(filteredResponses[selectedIndex].content);
                }
                return;
            }
            if (e.key === 'Escape') {
                setShowCanned(false);
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        startTyping();
    };

    return (
        <div className="border-t border-gray-200 p-4 bg-white relative">
            {/* Canned Responses Popup */}
            {showCanned && (
                <div className="absolute bottom-full left-4 mb-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-10">
                    <div className="p-2 border-b border-gray-100 text-xs font-semibold text-gray-500 bg-gray-50 flex justify-between">
                        <span>Hazır Cevaplar</span>
                        <span className="text-gray-400">Seçmek için Enter</span>
                    </div>
                    {filteredResponses.map((response, index) => (
                        <button
                            key={response.id}
                            onClick={() => handleCannedSelect(response.content)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-blue-50 transition ${index === selectedIndex ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : ''
                                }`}
                        >
                            <span className="truncate flex-1 text-gray-800">{response.content}</span>
                            <span className="ml-2 font-mono text-xs text-gray-500 bg-gray-100 px-1 rounded">/{response.shortcut}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Canned Response Manager Button */}
                <div className="pb-1">
                    <CannedResponseList currentUserId={userId} currentUserRole="agent" />
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={disabled || isSending}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isSending}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition h-[44px] w-[44px] flex items-center justify-center shrink-0"
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
                    <textarea
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Mesajınızı yazın... (/ ile hazır cevaplar)"
                        disabled={disabled || isSending}
                        rows={1}
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending || disabled}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed h-[44px]"
                    >
                        {isSending ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Gönder'
                        )}
                    </button>
                </form>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex justify-between items-center pl-10">
                <span>Enter ile gönder, Shift+Enter ile yeni satır</span>
                {showCanned && <span className="text-blue-600 font-medium">Hazır cevap seçiliyor... (ESC ile iptal)</span>}
            </p>
        </div>
    );
}
