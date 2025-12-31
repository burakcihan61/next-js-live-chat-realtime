import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { pusherServer } from '@/lib/pusher/server';

// POST /api/conversations/[id]/close - Close/resolve conversation
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [updatedConversation] = await db
            .update(conversations)
            .set({
                status: 'resolved',
                endedAt: new Date(),
            })
            .where(eq(conversations.id, id))
            .returning();

        if (!updatedConversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Trigger Pusher event
        await pusherServer.trigger(`conversation-${id}`, 'conversation-closed', {
            conversation: updatedConversation,
        });

        return NextResponse.json({
            success: true,
            data: updatedConversation,
        });
    } catch (error) {
        console.error('Close conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to close conversation' },
            { status: 500 }
        );
    }
}
