'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useInactivityTimeout } from '@/hooks/use-inactivity-timeout';
import { performLogout } from '@/lib/utils/session-cleanup';

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
    // Auto-logout after 5 minutes of inactivity
    useInactivityTimeout({
        timeout: 5 * 60 * 1000, // 5 minutes
        onTimeout: () => {
            console.log('⏱️ [Dashboard] Inactivity timeout - logging out');
            performLogout('/login');
        },
    });

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader user={user} />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
