import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { assignConversationSchema } from '@/lib/validations/conversation';
import { pusherServer } from '@/lib/pusher/server';

// POST /api/conversations/[id]/assign - Assign conversation to agent
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

        const body = await req.json();
        const validatedData = assignConversationSchema.parse(body);

        const [updatedConversation] = await db
            .update(conversations)
            .set({
                assignedAgentId: validatedData.agentId,
                status: 'active',
            })
            .where(eq(conversations.id, id))
            .returning();

        if (!updatedConversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Trigger Pusher event
        await pusherServer.trigger('conversations', 'conversation-assigned', {
            conversation: updatedConversation,
            agentId: validatedData.agentId,
        });

        return NextResponse.json({
            success: true,
            data: updatedConversation,
        });
    } catch (error) {
        console.error('Assign conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to assign conversation' },
            { status: 500 }
        );
    }
}
