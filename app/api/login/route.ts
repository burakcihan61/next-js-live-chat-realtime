import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/config';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = loginSchema.parse(body);

        const result = await signIn('credentials', {
            email: validatedData.email,
            password: validatedData.password,
            redirect: false,
        });

        if (!result || result.error) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Login failed' },
            { status: 500 }
        );
    }
}
