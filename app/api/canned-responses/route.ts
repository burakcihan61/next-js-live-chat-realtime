import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cannedResponses } from '@/drizzle/schema';
import { auth } from '@/lib/auth/config';
import { eq, or, desc, isNull } from 'drizzle-orm';

// GET /api/canned-responses - Get all responses (Global + User specific)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const responses = await db
            .select()
            .from(cannedResponses)
            .where(
                or(
                    eq(cannedResponses.userId, session.user.id),
                    isNull(cannedResponses.userId)
                )
            )
            .orderBy(desc(cannedResponses.createdAt));

        return NextResponse.json({
            success: true,
            data: responses,
        });
    } catch (error) {
        console.error('Error fetching canned responses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch canned responses' },
            { status: 500 }
        );
    }
}

// POST /api/canned-responses - Create new response
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { shortcut, content, isGlobal } = body;

        if (!shortcut || !content) {
            return NextResponse.json(
                { error: 'Shortcut and content are required' },
                { status: 400 }
            );
        }

        // Only admins can create global responses
        if (isGlobal && session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only admins can create global responses' },
                { status: 403 }
            );
        }

        const [newResponse] = await db
            .insert(cannedResponses)
            .values({
                shortcut,
                content,
                userId: isGlobal ? null : session.user.id,
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: newResponse,
        });
    } catch (error) {
        console.error('Error creating canned response:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create canned response' },
            { status: 500 }
        );
    }
}
