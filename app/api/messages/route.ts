import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, conversations } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { createMessageSchema } from '@/lib/validations/message';
import { pusherServer } from '@/lib/pusher/server';

// GET /api/messages - Get messages for a conversation
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
        }

        const messagesList = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(messages.createdAt);

        return NextResponse.json({
            success: true,
            data: messagesList,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/messages - Create new message
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = createMessageSchema.parse(body);

        const { conversationId, content, type, attachments } = validatedData;

        // Get sender info from request (could be from session or visitor session)
        const senderId = body.senderId;
        const senderType = body.senderType;

        if (!senderId || !senderType) {
            return NextResponse.json(
                { error: 'senderId and senderType are required' },
                { status: 400 }
            );
        }

        const [newMessage] = await db
            .insert(messages)
            .values({
                conversationId,
                senderId,
                senderType,
                content,
                type: type || 'text',
                attachments,
            })
            .returning();

        // Update conversation's lastMessageAt
        await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversationId));

        // Trigger Pusher event
        await pusherServer.trigger(
            `private-conversation-${conversationId}`,
            'new-message',
            { message: newMessage }
        );

        return NextResponse.json({
            success: true,
            data: newMessage,
        });
    } catch (error) {
        console.error('Create message error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create message' },
            { status: 500 }
        );
    }
}
