
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { rating, feedback } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Konuşmayı güncelle
        const [updatedConversation] = await db
            .update(conversations)
            .set({
                rating,
                feedback: feedback || null,
            })
            .where(eq(conversations.id, id))
            .returning();

        if (!updatedConversation) {
            return NextResponse.json(
                { success: false, error: 'Conversation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedConversation,
        });

    } catch (error) {
        console.error('Rating error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit rating' },
            { status: 500 }
        );
    }
}
