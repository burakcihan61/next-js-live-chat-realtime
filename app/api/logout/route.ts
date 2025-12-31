import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth/config';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        // Sign out from NextAuth
        await signOut({ redirect: false });

        // Also clear visitor session cookie if exists
        const cookieStore = await cookies();
        cookieStore.delete('visitor-session');

        return NextResponse.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        );
    }
}
