
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
    try {
        // Kontrol et: En az bir 'online' agent var mı?
        const onlineAgents = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.role, 'agent'),
                    eq(users.status, 'online')
                )
            );

        // Adminler de destek verebilir, onları da sayabiliriz isterseniz.
        // Şimdilik sadece role='agent' ve status='online' olanlar.

        return NextResponse.json({
            success: true,
            isOnline: onlineAgents.length > 0
        });

    } catch (error) {
        console.error('Widget status error:', error);
        return NextResponse.json({ success: false, isOnline: false }, { status: 500 });
    }
}
