import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages as messagesTable, visitors } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { updateConversationSchema } from '@/lib/validations/conversation';
import { pusherServer } from '@/lib/pusher/server';

// GET /api/conversations/[id] - Get single conversation
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [result] = await db
            .select()
            .from(conversations)
            .leftJoin(visitors, eq(conversations.visitorId, visitors.id))
            .where(eq(conversations.id, id))
            .limit(1);

        if (!result) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversation = {
            ...result.conversations,
            visitor: result.visitors
        };

        return NextResponse.json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}

// PATCH /api/conversations/[id] - Update conversation
export async function PATCH(
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
        const validatedData = updateConversationSchema.parse(body);

        const [updatedConversation] = await db
            .update(conversations)
            .set(validatedData)
            .where(eq(conversations.id, id))
            .returning();

        if (!updatedConversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Trigger Pusher event
        await pusherServer.trigger(
            `private-conversation-${id}`,
            'conversation-updated',
            { conversation: updatedConversation }
        );

        return NextResponse.json({
            success: true,
            data: updatedConversation,
        });
    } catch (error) {
        console.error('Update conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update conversation' },
            { status: 500 }
        );
    }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete associated messages first
        await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));

        // Delete conversation
        await db.delete(conversations).where(eq(conversations.id, id));

        return NextResponse.json({
            success: true,
            message: 'Conversation deleted successfully',
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete conversation' },
            { status: 500 }
        );
    }
}
