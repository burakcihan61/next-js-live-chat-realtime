import { create } from 'zustand';

interface UIStore {
    // Widget state
    isWidgetOpen: boolean;
    isWidgetMinimized: boolean;

    // Dashboard state
    isSidebarOpen: boolean;
    isVisitorInfoOpen: boolean;

    // Actions
    toggleWidget: () => void;
    openWidget: () => void;
    closeWidget: () => void;
    toggleWidgetMinimize: () => void;
    toggleSidebar: () => void;
    toggleVisitorInfo: () => void;
    setWidgetOpen: (isOpen: boolean) => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setVisitorInfoOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isWidgetOpen: false,
    isWidgetMinimized: false,
    isSidebarOpen: true,
    isVisitorInfoOpen: true,

    toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
    openWidget: () => set({ isWidgetOpen: true, isWidgetMinimized: false }),
    closeWidget: () => set({ isWidgetOpen: false }),
    toggleWidgetMinimize: () => set((state) => ({ isWidgetMinimized: !state.isWidgetMinimized })),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleVisitorInfo: () => set((state) => ({ isVisitorInfoOpen: !state.isVisitorInfoOpen })),
    setWidgetOpen: (isOpen) => set({ isWidgetOpen: isOpen }),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setVisitorInfoOpen: (isOpen) => set({ isVisitorInfoOpen: isOpen }),
}));
