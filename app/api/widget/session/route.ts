import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors, conversations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Helper function to get IP address from request
function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    let ip = 'unknown';

    if (forwarded) {
        ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
        ip = realIp;
    }

    // Normalize localhost addresses (IPv4 and IPv6)
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
        return 'localhost';
    }

    // Handle IPv4-mapped IPv6 addresses
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    return ip;
}

// Helper function to get location from IP (using ipapi.co free service)
async function getLocationFromIp(ip: string) {
    // Handle localhost and private IPs
    if (ip === 'unknown' ||
        ip === 'localhost' ||
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.')) {
        return {
            city: 'Local',
            region: 'Development',
            country: 'Local Network',
        };
    }

    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            headers: { 'User-Agent': 'Live Chat App' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch location');
        }

        const data = await response.json();
        return {
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country_name || 'Unknown',
        };
    } catch (error) {
        console.error('Location lookup error:', error);
        return {
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
        };
    }
}

// POST /api/widget/session - Create or get visitor session
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const sessionId = body.sessionId || nanoid();

        // Get IP address
        const ipAddress = getClientIp(req);

        // Get location from IP
        const location = await getLocationFromIp(ipAddress);

        // Get user agent and other metadata
        const userAgent = body.userAgent || req.headers.get('user-agent') || 'Unknown';
        const metadata = {
            browser: userAgent,
            language: req.headers.get('accept-language')?.split(',')[0] || 'Unknown',
            referrer: body.referrer || 'Direct',
        };

        // Check if visitor exists
        let [visitor] = await db
            .select()
            .from(visitors)
            .where(eq(visitors.sessionId, sessionId))
            .limit(1);

        if (!visitor) {
            // Create new visitor
            [visitor] = await db
                .insert(visitors)
                .values({
                    sessionId,
                    name: body.name,
                    email: body.email,
                    ipAddress,
                    location,
                    userAgent,
                    metadata,
                })
                .returning();
        } else {
            // Update lastSeenAt and location
            [visitor] = await db
                .update(visitors)
                .set({
                    lastSeenAt: new Date(),
                    ipAddress,
                    location,
                })
                .where(eq(visitors.id, visitor.id))
                .returning();
        }

        // Check if there's an active conversation for this visitor
        const [activeConversation] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.visitorId, visitor.id))
            .orderBy(conversations.startedAt)
            .limit(1);

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            data: {
                visitorId: visitor.id,
                sessionId: visitor.sessionId,
                conversationId: activeConversation?.id,
            },
        });

        // Set visitor session cookie for Pusher auth
        response.cookies.set('visitor-session', visitor.sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Widget session error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create session' },
            { status: 500 }
        );
    }
}
