'use client';

import { Message } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MessageItemProps {
    message: Message;
    isAgent: boolean;
}

export function MessageItem({ message, isAgent }: MessageItemProps) {
    return (
        <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isAgent ? 'order-2' : 'order-1'}`}>
                <div
                    className={`rounded-2xl px-4 py-2 ${isAgent
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
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
                                        className="max-w-full h-auto max-h-64 object-cover"
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
                <p className={`text-xs text-gray-500 mt-1 ${isAgent ? 'text-right' : 'text-left'}`}>
                    {format(new Date(message.createdAt), 'HH:mm', { locale: tr })}
                </p>
            </div>
        </div>
    );
}
