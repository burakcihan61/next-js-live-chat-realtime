import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { files } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [file] = await db
            .select()
            .from(files)
            .where(eq(files.id, id))
            .limit(1);

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Decode Base64
        const buffer = Buffer.from(file.data, 'base64');

        // Return file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': file.mimeType,
                'Content-Length': file.size.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('File fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch file' },
            { status: 500 }
        );
    }
}
