import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq, or } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all admins and agents
        const agents = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                status: users.status,
            })
            .from(users)
            .where(or(eq(users.role, 'admin'), eq(users.role, 'agent')));

        return NextResponse.json({
            success: true,
            data: agents,
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch agents' },
            { status: 500 }
        );
    }
}
