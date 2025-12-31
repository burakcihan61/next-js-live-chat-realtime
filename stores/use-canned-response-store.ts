import { create } from 'zustand';

interface CannedResponse {
    id: string;
    shortcut: string;
    content: string;
    userId: string | null;
    createdAt: string;
}

interface CannedResponseStore {
    responses: CannedResponse[];
    isLoading: boolean;
    fetchResponses: () => Promise<void>;
    addResponse: (shortcut: string, content: string, isGlobal: boolean) => Promise<boolean>;
    updateResponse: (id: string, shortcut: string, content: string) => Promise<boolean>;
    deleteResponse: (id: string) => Promise<boolean>;
}

export const useCannedResponseStore = create<CannedResponseStore>((set, get) => ({
    responses: [],
    isLoading: false,

    fetchResponses: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/canned-responses');
            const data = await res.json();
            if (data.success) {
                set({ responses: data.data });
            }
        } catch (error) {
            console.error('Failed to fetch responses:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addResponse: async (shortcut, content, isGlobal) => {
        try {
            const res = await fetch('/api/canned-responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shortcut, content, isGlobal }),
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({ responses: [data.data, ...state.responses] }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add response:', error);
            return false;
        }
    },

    updateResponse: async (id, shortcut, content) => {
        try {
            const res = await fetch(`/api/canned-responses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shortcut, content }),
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    responses: state.responses.map((r) => (r.id === id ? data.data : r)),
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update response:', error);
            return false;
        }
    },

    deleteResponse: async (id) => {
        try {
            const res = await fetch(`/api/canned-responses/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    responses: state.responses.filter((r) => r.id !== id),
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete response:', error);
            return false;
        }
    },
}));
