import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, visitors, users } from '@/drizzle/schema';
import { eq, desc, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { createConversationSchema } from '@/lib/validations/conversation';
import { pusherServer } from '@/lib/pusher/server';

// GET /api/conversations - Get all conversations
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const agentId = searchParams.get('agentId');

        // Filter condition: If status is provided, match it. Otherwise, exclude 'closed'.
        const whereCondition = status
            ? eq(conversations.status, status)
            : ne(conversations.status, 'closed');

        let query = db
            .select()
            .from(conversations)
            .leftJoin(visitors, eq(conversations.visitorId, visitors.id))
            .leftJoin(users, eq(conversations.assignedAgentId, users.id))
            .where(whereCondition)
            .orderBy(desc(conversations.lastMessageAt));

        // Apply filters if provided
        // Note: This is a simplified version. You may want to add more complex filtering

        const results = await query;

        const formattedConversations = results.map((row) => ({
            ...row.conversations,
            visitor: row.visitors,
            assignedAgent: row.users,
            messages: [], // Messages will be loaded separately
        }));

        return NextResponse.json({
            success: true,
            data: formattedConversations,
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST /api/conversations - Create new conversation
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, subject, tags } = body;

        if (!visitorId) {
            return NextResponse.json(
                { success: false, error: 'Visitor ID is required' },
                { status: 400 }
            );
        }

        // Check if visitor has active conversation? (Optional)

        const [conversation] = await db
            .insert(conversations)
            .values({
                visitorId,
                status: 'pending',
                subject: subject || null,
                tags: tags || [],
                priority: null, // Set priority to null as it's not provided in the new body structure
            })
            .returning();

        // Trigger Pusher event for new conversation
        await pusherServer.trigger('conversations', 'new-conversation', {
        });

        return NextResponse.json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
