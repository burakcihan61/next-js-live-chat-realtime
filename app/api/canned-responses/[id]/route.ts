import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cannedResponses } from '@/drizzle/schema';
import { auth } from '@/lib/auth/config';
import { eq, and, isNull } from 'drizzle-orm';

// PATCH /api/canned-responses/[id] - Update response
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
        const { shortcut, content } = body;

        // Check ownership or admin rights
        const [existing] = await db
            .select()
            .from(cannedResponses)
            .where(eq(cannedResponses.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json({ error: 'Response not found' }, { status: 404 });
        }

        // Allow update if user owns it OR (user is admin AND it's a global response)
        const isOwner = existing.userId === session.user.id;
        const isGlobal = existing.userId === null;
        const isAdmin = session.user.role === 'admin';

        if (!isOwner && !(isGlobal && isAdmin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const [updatedResponse] = await db
            .update(cannedResponses)
            .set({
                shortcut: shortcut || existing.shortcut,
                content: content || existing.content,
            })
            .where(eq(cannedResponses.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedResponse,
        });
    } catch (error) {
        console.error('Error updating canned response:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update canned response' },
            { status: 500 }
        );
    }
}

// DELETE /api/canned-responses/[id] - Delete response
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check ownership or admin rights
        const [existing] = await db
            .select()
            .from(cannedResponses)
            .where(eq(cannedResponses.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json({ error: 'Response not found' }, { status: 404 });
        }

        const isOwner = existing.userId === session.user.id;
        const isGlobal = existing.userId === null;
        const isAdmin = session.user.role === 'admin';

        if (!isOwner && !(isGlobal && isAdmin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await db.delete(cannedResponses).where(eq(cannedResponses.id, id));

        return NextResponse.json({
            success: true,
            message: 'Response deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting canned response:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete canned response' },
            { status: 500 }
        );
    }
}
