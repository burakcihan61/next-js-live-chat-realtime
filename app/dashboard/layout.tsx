import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Sadece admin rolüne sahip kullanıcılar dashboard'a erişebilir
    if (session.user.role !== 'admin') {
        redirect('/login?error=unauthorized');
    }

    return (
        <DashboardLayoutClient user={session.user}>
            {children}
        </DashboardLayoutClient>
    );
}
