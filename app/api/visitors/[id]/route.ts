import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// GET /api/visitors/[id] - Get single visitor
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [visitor] = await db
            .select()
            .from(visitors)
            .where(eq(visitors.id, id))
            .limit(1);

        if (!visitor) {
            return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: visitor,
        });
    } catch (error) {
        console.error('Get visitor error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch visitor' },
            { status: 500 }
        );
    }
}

// PATCH /api/visitors/[id] - Update visitor
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const [updatedVisitor] = await db
            .update(visitors)
            .set({
                name: body.name,
                email: body.email,
                metadata: body.metadata,
                lastSeenAt: new Date(),
            })
            .where(eq(visitors.id, id))
            .returning();

        if (!updatedVisitor) {
            return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: updatedVisitor,
        });
    } catch (error) {
        console.error('Update visitor error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update visitor' },
            { status: 500 }
        );
    }
}
