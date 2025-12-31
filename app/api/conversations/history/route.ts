
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { conversations, visitors, users } from '@/drizzle/schema';
import { eq, and, or, desc, ilike, inArray, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        // Base conditions: Status must be closed or resolved
        const baseCondition = inArray(conversations.status, ['closed', 'resolved']);

        // Search condition
        let searchCondition = undefined;
        if (search) {
            searchCondition = or(
                ilike(visitors.name, `%${search}%`),
                ilike(visitors.email, `%${search}%`)
            );
        }

        const finalCondition = searchCondition
            ? and(baseCondition, searchCondition)
            : baseCondition;

        // Get total count
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(conversations)
            .leftJoin(visitors, eq(conversations.visitorId, visitors.id))
            .where(finalCondition);

        // Get data
        const history = await db
            .select({
                id: conversations.id,
                status: conversations.status,
                startedAt: conversations.startedAt,
                endedAt: conversations.endedAt,
                visitorName: visitors.name,
                visitorEmail: visitors.email,
                agentName: users.name,
                rating: conversations.rating,
                tags: conversations.tags,
            })
            .from(conversations)
            .leftJoin(visitors, eq(conversations.visitorId, visitors.id))
            .leftJoin(users, eq(conversations.assignedAgentId, users.id))
            .where(finalCondition)
            .orderBy(desc(conversations.endedAt))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            success: true,
            data: history,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(Number(count) / limit)
            }
        });

    } catch (error) {
        console.error('History fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
