'use client';

import { useState, useEffect } from 'react';
import { useConversationStore } from '@/stores/use-conversation-store';
import { ConversationWithRelations } from '@/types';

interface ConversationActionsProps {
    conversation: ConversationWithRelations;
    currentUserId: string;
}

interface Agent {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

export function ConversationActions({ conversation, currentUserId }: ConversationActionsProps) {
    const { updateConversation } = useConversationStore();
    const [isReassigning, setIsReassigning] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [showAgentsList, setShowAgentsList] = useState(false);

    const isAssignedToMe = conversation.assignedAgentId === currentUserId;
    const isPending = conversation.status === 'pending';

    const fetchAgents = async () => {
        if (agents.length > 0) {
            setShowAgentsList(true);
            return;
        }

        setLoadingAgents(true);
        try {
            const response = await fetch('/api/agents');
            const data = await response.json();
            if (data.success) {
                // Filter out current user
                const otherAgents = data.data.filter((a: Agent) => a.id !== currentUserId);
                setAgents(otherAgents);
                setShowAgentsList(true);
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleHold = async () => {
        try {
            await fetch(`/api/conversations/${conversation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'pending' }),
            });
            // Store update is handled by realtime event usually, but we can do optimistic too if needed
        } catch (error) {
            console.error('Error putting on hold:', error);
        }
    };

    const handleReassign = async (newAgentId: string) => {
        try {
            await fetch(`/api/conversations/${conversation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignedAgentId: newAgentId,
                    status: 'active' // Ensure active when reassigned
                }),
            });
            setShowAgentsList(false);
            // Optional: Show toast
        } catch (error) {
            console.error('Error reassigning:', error);
        }
    };

    if (!isAssignedToMe) return null;

    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {/* Hold Button */}
            {!isPending && (
                <button
                    onClick={handleHold}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Beklemeye Al
                </button>
            )}

            {/* Reassign Button */}
            <div className="relative flex-1">
                <button
                    onClick={() => showAgentsList ? setShowAgentsList(false) : fetchAgents()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Devret
                </button>

                {/* Agents Dropdown */}
                {showAgentsList && (
                    <div className="absolute bottom-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl mb-2 z-50">
                        <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <span className="text-xs font-semibold text-gray-600">
                                Temsilci Seç
                            </span>
                            <button
                                onClick={() => setShowAgentsList(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                            {loadingAgents ? (
                                <div className="p-3 text-center text-xs text-gray-500">Yükleniyor...</div>
                            ) : agents.length === 0 ? (
                                <div className="p-3 text-center text-xs text-gray-500">Başka temsilci bulunamadı</div>
                            ) : (
                                agents.map((agent) => (
                                    <button
                                        key={agent.id}
                                        onClick={() => handleReassign(agent.id)}
                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2 transition"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                            {agent.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
