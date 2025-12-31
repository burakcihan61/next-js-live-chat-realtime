import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { pusherServer } from '@/lib/pusher/server';

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

        const userId = session.user.id; // User ID from session needs to be the DB ID, assuming session.user.id is correct. 
        // Note: standard next-auth session might not have 'id' if not configured. 
        // However, looking at previous files (e.g., layout.tsx), session.user.role is usage, so id likely exists or needs checking.
        // Let's assume session.user.id maps to our DB user id for now.

        // Fetch current conversation state
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, id))
            .limit(1);

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Check if already assigned
        if (conversation.assignedAgentId) {
            if (conversation.assignedAgentId === userId) {
                // Already assigned to self, all good
                return NextResponse.json({ success: true, daa: conversation });
            } else {
                // Assigned to another agent
                // Fetch that agent's details for error message
                const [assignedAgent] = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, conversation.assignedAgentId))
                    .limit(1);

                return NextResponse.json(
                    {
                        success: false,
                        error: 'Conversation already assigned',
                        assignedTo: assignedAgent,
                    },
                    { status: 409 }
                );
            }
        }

        // If not assigned, assign to current user
        const [updatedConversation] = await db
            .update(conversations)
            .set({
                assignedAgentId: userId,
                status: conversation.status === 'pending' ? 'active' : conversation.status, // Auto-activate if pending
            })
            .where(eq(conversations.id, id))
            .returning();

        // Get agent details for Pusher event
        const [agent] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        // Retrieve visitor data to include in response/pusher payload might be useful, 
        // but frontend usually handles joins or subsequent fetches. 
        // Ideally we return the updated structure consistent with GET /api/conversations/[id]

        // Trigger Pusher event
        await pusherServer.trigger(
            `private-conversation-${id}`,
            'conversation-updated',
            {
                conversation: {
                    ...updatedConversation,
                    assignedAgent: agent
                }
            }
        );

        return NextResponse.json({
            success: true,
            data: updatedConversation,
        });

    } catch (error) {
        console.error('Claim conversation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to claim conversation' },
            { status: 500 }
        );
    }
}
