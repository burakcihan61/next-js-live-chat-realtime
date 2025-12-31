'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface WidgetMessagesProps {
    messages: Message[];
    isTyping: boolean;
}

export function WidgetMessages({ messages, isTyping }: WidgetMessagesProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-sm text-center">Konuşmaya başlayın</p>
                <p className="text-xs text-center mt-2 text-gray-400">Size yardımcı olmak için buradayız</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => {
                const isAgent = message.senderType === 'agent';
                return (
                    <div key={message.id} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] ${isAgent ? 'order-1' : 'order-2'}`}>
                            <div
                                className={`rounded-2xl px-4 py-2 ${isAgent
                                    ? 'bg-gray-200 text-gray-900 rounded-tl-none'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                                    }`}
                            >
                                {message.type === 'image' && message.attachments && message.attachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {message.attachments.map((attachment, index) => (
                                            <div key={index} className="rounded-lg overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name || 'Resim'}
                                                    className="max-w-full h-auto max-h-48 object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                        {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
                                    </div>
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                )}
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${isAgent ? 'text-left' : 'text-right'}`}>
                                {format(new Date(message.createdAt), 'HH:mm', { locale: tr })}
                            </p>
                        </div>
                    </div>
                );
            })}

            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
