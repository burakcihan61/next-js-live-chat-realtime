'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PriorityButtonProps {
    conversationId: string;
    currentPriority: 'low' | 'medium' | 'high' | 'urgent';
}

const priorityConfig = {
    low: {
        label: 'Düşük',
        color: 'bg-gray-100 text-gray-800',
        hoverColor: 'hover:bg-gray-200',
        icon: '↓',
    },
    medium: {
        label: 'Orta',
        color: 'bg-blue-100 text-blue-800',
        hoverColor: 'hover:bg-blue-200',
        icon: '→',
    },
    high: {
        label: 'Yüksek',
        color: 'bg-orange-100 text-orange-800',
        hoverColor: 'hover:bg-orange-200',
        icon: '↑',
    },
    urgent: {
        label: 'Acil',
        color: 'bg-red-100 text-red-800',
        hoverColor: 'hover:bg-red-200',
        icon: '⚠',
    },
};

export function PriorityButton({ conversationId, currentPriority }: PriorityButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Ensure priority is valid, default to 'medium'
    const validPriority = (currentPriority && currentPriority in priorityConfig)
        ? currentPriority
        : 'medium';

    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(validPriority);
    const router = useRouter();

    const handlePriorityChange = async (newPriority: typeof currentPriority) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority }),
            });

            const data = await response.json();

            if (data.success) {
                setPriority(newPriority);
                setIsOpen(false);
                router.refresh();
            } else {
                alert('Öncelik güncellenemedi: ' + data.error);
            }
        } catch (error) {
            console.error('Priority update error:', error);
            alert('Bir hata oluştu');
        } finally {
            setIsUpdating(false);
        }
    };

    const currentConfig = priorityConfig[priority];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentConfig.color} ${currentConfig.hoverColor} disabled:opacity-50`}
            >
                <span>{currentConfig.icon}</span>
                <span>{currentConfig.label}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-2 space-y-1">
                            {Object.entries(priorityConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePriorityChange(key as typeof currentPriority)}
                                    disabled={isUpdating}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${priority === key
                                        ? config.color
                                        : 'text-gray-700 hover:bg-gray-100'
                                        } disabled:opacity-50`}
                                >
                                    <span>{config.icon}</span>
                                    <span>{config.label}</span>
                                    {priority === key && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
