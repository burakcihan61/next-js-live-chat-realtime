import { create } from 'zustand';

interface TypingUser {
    userId: string;
    userName: string;
    userType: 'agent' | 'visitor';
    timestamp: number;
}

interface TypingStore {
    // State: conversationId -> typing users
    typingByConversation: Record<string, TypingUser[]>;

    // Actions
    setTyping: (conversationId: string, user: TypingUser) => void;
    removeTyping: (conversationId: string, userId: string) => void;
    clearTyping: (conversationId: string) => void;

    // Computed
    getTypingUsers: (conversationId: string) => TypingUser[];
    isTyping: (conversationId: string) => boolean;
}

export const useTypingStore = create<TypingStore>((set, get) => ({
    typingByConversation: {},

    setTyping: (conversationId, user) =>
        set((state) => {
            const currentTyping = state.typingByConversation[conversationId] || [];
            const filtered = currentTyping.filter((u) => u.userId !== user.userId);
            return {
                typingByConversation: {
                    ...state.typingByConversation,
                    [conversationId]: [...filtered, user],
                },
            };
        }),

    removeTyping: (conversationId, userId) =>
        set((state) => {
            const currentTyping = state.typingByConversation[conversationId] || [];
            return {
                typingByConversation: {
                    ...state.typingByConversation,
                    [conversationId]: currentTyping.filter((u) => u.userId !== userId),
                },
            };
        }),

    clearTyping: (conversationId) =>
        set((state) => {
            const newTyping = { ...state.typingByConversation };
            delete newTyping[conversationId];
            return { typingByConversation: newTyping };
        }),

    getTypingUsers: (conversationId) => {
        const { typingByConversation } = get();
        const now = Date.now();
        const users = typingByConversation[conversationId] || [];
        // Filter out stale typing indicators (older than 5 seconds)
        return users.filter((u) => now - u.timestamp < 5000);
    },

    isTyping: (conversationId) => {
        const users = get().getTypingUsers(conversationId);
        return users.length > 0;
    },
}));
