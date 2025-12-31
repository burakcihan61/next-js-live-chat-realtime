import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { pusherServer } from '@/lib/pusher/server';

export async function POST(req: NextRequest) {
    try {
        const { conversationId, visitorId } = await req.json();

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: 'Conversation ID is required' },
                { status: 400 }
            );
        }

        // Konuşmayı kapat
        const [updatedConversation] = await db
            .update(conversations)
            .set({
                status: 'closed',
                endedAt: new Date(),
            })
            .where(eq(conversations.id, conversationId))
            .returning();

        if (!updatedConversation) {
            return NextResponse.json(
                { success: false, error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Pusher event gönder - private channel kullan
        await pusherServer.trigger(
            `private-conversation-${conversationId}`,
            'conversation-ended',
            {
                conversationId,
                endedBy: visitorId ? 'visitor' : 'admin',
                endedAt: updatedConversation.endedAt,
                message: visitorId ? 'Konuşmayı sonlandırdınız' : 'Konuşma yönetici tarafından sonlandırıldı',
            }
        );

        // Response oluştur
        const response = NextResponse.json({
            success: true,
            data: updatedConversation,
        });

        // Eğer ziyaretçi sonlandırıyorsa, session cookie'sini temizle
        if (visitorId) {
            response.cookies.delete('visitor-session');
            response.cookies.delete('visitor-id');
        }

        return response;
    } catch (error) {
        console.error('End conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to end conversation' },
            { status: 500 }
        );
    }
}
