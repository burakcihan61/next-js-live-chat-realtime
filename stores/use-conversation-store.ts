import { create } from 'zustand';
import { Conversation, ConversationWithRelations } from '@/types';

interface ConversationStore {
    conversations: ConversationWithRelations[];
    selectedConversationId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setConversations: (conversations: ConversationWithRelations[]) => void;
    addConversation: (conversation: ConversationWithRelations) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    removeConversation: (id: string) => void;
    selectConversation: (id: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Computed
    getSelectedConversation: () => ConversationWithRelations | null;
    getPendingConversations: () => ConversationWithRelations[];
    getActiveConversations: () => ConversationWithRelations[];
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
    conversations: [],
    selectedConversationId: null,
    isLoading: false,
    error: null,

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    updateConversation: (id, updates) =>
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv.id === id ? { ...conv, ...updates } : conv
            ),
        })),

    claimConversation: async (id: string) => {
        try {
            const response = await fetch(`/api/conversations/${id}/claim`, {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === id ? { ...c, ...data.data } : c
                    ),
                }));
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.error,
                    assignedTo: data.assignedTo
                };
            }
        } catch (error) {
            console.error('Claim error:', error);
            return { success: false, error: 'Network error' };
        }
    },

    removeConversation: (id) =>
        set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
        })),

    selectConversation: (id) => set({ selectedConversationId: id }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    getSelectedConversation: () => {
        const { conversations, selectedConversationId } = get();
        return conversations.find((conv) => conv.id === selectedConversationId) || null;
    },

    getPendingConversations: () => {
        const { conversations } = get();
        return conversations.filter((conv) => conv.status === 'pending');
    },

    getActiveConversations: () => {
        const { conversations } = get();
        return conversations.filter((conv) => conv.status === 'active');
    },
}));
