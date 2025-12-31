import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { auth } from '@/lib/auth/config';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        // Check for authenticated user (admin/agent)
        const session = await auth();

        // Check for visitor session
        const cookieStore = await cookies();
        const visitorSessionId = cookieStore.get('visitor-session')?.value;

        // Allow access if either authenticated user or has visitor session
        if (!session?.user && !visitorSessionId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get('socket_id');
        const channelName = params.get('channel_name');

        if (!socketId || !channelName) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Verify user has access to this channel
        // Channel format: private-conversation-{conversationId}
        const authResponse = pusherServer.authorizeChannel(socketId, channelName);

        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
