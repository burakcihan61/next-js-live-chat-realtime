import { z } from 'zod';

export const createMessageSchema = z.object({
    conversationId: z.string().uuid('Geçerli bir conversation ID giriniz'),
    content: z.string().min(1, 'Mesaj içeriği boş olamaz'),
    type: z.enum(['text', 'file', 'image', 'system']).default('text'),
    attachments: z.array(z.object({
        url: z.string(), // Allow relative URLs (e.g. /api/files/...)
        name: z.string(),
        type: z.string(),
        size: z.number(),
    })).optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
