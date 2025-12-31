import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/visitors - Get all visitors
export async function GET(req: NextRequest) {
    try {
        const visitorsList = await db
            .select()
            .from(visitors)
            .orderBy(visitors.lastSeenAt);

        return NextResponse.json({
            success: true,
            data: visitorsList,
        });
    } catch (error) {
        console.error('Get visitors error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch visitors' },
            { status: 500 }
        );
    }
}

// POST /api/visitors - Create new visitor
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const sessionId = body.sessionId || nanoid();

        // Check if visitor with this sessionId already exists
        const [existingVisitor] = await db
            .select()
            .from(visitors)
            .where(eq(visitors.sessionId, sessionId))
            .limit(1);

        if (existingVisitor) {
            // Update lastSeenAt
            const [updatedVisitor] = await db
                .update(visitors)
                .set({ lastSeenAt: new Date() })
                .where(eq(visitors.id, existingVisitor.id))
                .returning();

            return NextResponse.json({
                success: true,
                data: updatedVisitor,
            });
        }

        // Create new visitor
        const [newVisitor] = await db
            .insert(visitors)
            .values({
                sessionId,
                name: body.name,
                email: body.email,
                userAgent: body.userAgent,
                ipAddress: body.ipAddress,
                location: body.location,
                metadata: body.metadata,
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: newVisitor,
        });
    } catch (error) {
        console.error('Create visitor error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create visitor' },
            { status: 500 }
        );
    }
}
