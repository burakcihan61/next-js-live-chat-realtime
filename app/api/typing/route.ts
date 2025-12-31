import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';

// POST /api/typing - Handle typing indicators
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { conversationId, userId, userName, userType, isTyping } = body;

        if (!conversationId || !userId || !userType) {
            return NextResponse.json(
                { error: 'conversationId, userId, and userType are required' },
                { status: 400 }
            );
        }

        // Trigger Pusher event
        await pusherServer.trigger(
            `private-conversation-${conversationId}`,
            isTyping ? 'user-typing' : 'user-stopped-typing',
            {
                userId,
                userName,
                userType,
                timestamp: Date.now(),
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Typing indicator sent',
        });
    } catch (error) {
        console.error('Typing indicator error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send typing indicator' },
            { status: 500 }
        );
    }
}
