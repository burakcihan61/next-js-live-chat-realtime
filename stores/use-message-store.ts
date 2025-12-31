import { create } from 'zustand';
import { Message } from '@/types';

interface MessageStore {
    // State: conversationId -> messages
    messagesByConversation: Record<string, Message[]>;
    isLoading: boolean;
    error: string | null;

    // Actions
    setMessages: (conversationId: string, messages: Message[]) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
    removeMessage: (conversationId: string, messageId: string) => void;
    clearMessages: (conversationId: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Computed
    getMessages: (conversationId: string) => Message[];
    getUnreadCount: (conversationId: string) => number;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
    messagesByConversation: {},
    isLoading: false,
    error: null,

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: messages,
            },
        })),

    addMessage: (conversationId, message) =>
        set((state) => {
            const currentMessages = state.messagesByConversation[conversationId] || [];
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: [...currentMessages, message],
                },
            };
        }),

    updateMessage: (conversationId, messageId, updates) =>
        set((state) => {
            const currentMessages = state.messagesByConversation[conversationId] || [];
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: currentMessages.map((msg) =>
                        msg.id === messageId ? { ...msg, ...updates } : msg
                    ),
                },
            };
        }),

    removeMessage: (conversationId, messageId) =>
        set((state) => {
            const currentMessages = state.messagesByConversation[conversationId] || [];
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: currentMessages.filter((msg) => msg.id !== messageId),
                },
            };
        }),

    clearMessages: (conversationId) =>
        set((state) => {
            const newMessages = { ...state.messagesByConversation };
            delete newMessages[conversationId];
            return { messagesByConversation: newMessages };
        }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    getMessages: (conversationId) => {
        const { messagesByConversation } = get();
        return messagesByConversation[conversationId] || [];
    },

    getUnreadCount: (conversationId) => {
        const { messagesByConversation } = get();
        const messages = messagesByConversation[conversationId] || [];
        return messages.filter((msg) => !msg.isRead && msg.senderType === 'visitor').length;
    },
}));
