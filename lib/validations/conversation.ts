import { z } from 'zod';

export const createConversationSchema = z.object({
    visitorId: z.string().uuid('Geçerli bir visitor ID giriniz'),
    subject: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export const updateConversationSchema = z.object({
    status: z.enum(['pending', 'active', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    subject: z.string().optional(),
    tags: z.array(z.string()).optional(),
    rating: z.number().min(1).max(5).optional(),
    feedback: z.string().optional(),
    assignedAgentId: z.string().uuid().nullable().optional(),
});

export const assignConversationSchema = z.object({
    agentId: z.string().uuid('Geçerli bir agent ID giriniz'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type AssignConversationInput = z.infer<typeof assignConversationSchema>;
