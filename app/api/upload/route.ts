import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { files } from '@/drizzle/schema';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const visitorSession = req.cookies.get('visitor-session');

        if (!session?.user && !visitorSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size too large. Max 5MB allowed.' },
                { status: 400 }
            );
        }

        // Convert file to Base64
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Data = buffer.toString('base64');

        // Insert into database
        const [insertedFile] = await db.insert(files).values({
            name: file.name,
            mimeType: file.type,
            size: file.size,
            data: base64Data,
        }).returning();

        const url = `/api/files/${insertedFile.id}`;

        return NextResponse.json({
            success: true,
            data: {
                url,
                name: insertedFile.name,
                type: insertedFile.mimeType,
                size: insertedFile.size
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
