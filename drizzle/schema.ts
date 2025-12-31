import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users tablosu (Yetkililer - Agents/Admins)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull().default('agent'), // 'admin' | 'agent'
    avatar: text('avatar'),
    status: text('status').notNull().default('offline'), // 'online' | 'offline' | 'away'
    department: text('department'), // 'Satış', 'Teknik Destek', 'Muhasebe'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Visitors tablosu (Ziyaretçiler/Kullanıcılar)
export const visitors = pgTable('visitors', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email'),
    sessionId: text('session_id').notNull().unique(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    location: jsonb('location').$type<{ country?: string; city?: string; region?: string }>(),
    metadata: jsonb('metadata').$type<Record<string, any>>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
});

// Conversations tablosu (Konuşmalar)
export const conversations = pgTable('conversations', {
    id: uuid('id').defaultRandom().primaryKey(),
    visitorId: uuid('visitor_id').references(() => visitors.id).notNull(),
    assignedAgentId: uuid('assigned_agent_id').references(() => users.id),
    status: text('status').notNull().default('pending'), // 'pending' | 'active' | 'resolved' | 'closed'
    priority: text('priority').default('normal'), // 'low' | 'normal' | 'high' | 'urgent'
    subject: text('subject'),
    tags: jsonb('tags').$type<string[]>().default([]),
    rating: integer('rating'), // 1-5 yıldız
    feedback: text('feedback'),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    endedAt: timestamp('ended_at'),
    lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
});

// Messages tablosu (Mesajlar)
export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
    senderId: uuid('sender_id').notNull(), // user veya visitor id
    senderType: text('sender_type').notNull(), // 'agent' | 'visitor'
    content: text('content').notNull(),
    type: text('type').notNull().default('text'), // 'text' | 'file' | 'image' | 'system'
    attachments: jsonb('attachments').$type<Array<{ url: string; name: string; type: string; size: number }>>(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// TypingIndicators tablosu (Yazıyor göstergesi)
export const typingIndicators = pgTable('typing_indicators', {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
    userId: uuid('user_id').notNull(),
    userType: text('user_type').notNull(), // 'agent' | 'visitor'
    expiresAt: timestamp('expires_at').notNull(),
});

// Canned Responses tablosu (Hazır Cevaplar)
export const cannedResponses = pgTable('canned_responses', {
    id: uuid('id').defaultRandom().primaryKey(),
    shortcut: text('shortcut').notNull(),
    content: text('content').notNull(),
    userId: uuid('user_id').references(() => users.id), // Null ise global
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Files tablosu (Dosyalar)
export const files = pgTable('files', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    mimeType: text('mime_type').notNull(),
    data: text('data').notNull(), // Base64 encoded string
    size: integer('size').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    conversations: many(conversations),
    cannedResponses: many(cannedResponses),
}));

export const visitorsRelations = relations(visitors, ({ many }) => ({
    conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    visitor: one(visitors, {
        fields: [conversations.visitorId],
        references: [visitors.id],
    }),
    assignedAgent: one(users, {
        fields: [conversations.assignedAgentId],
        references: [users.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));

export const cannedResponsesRelations = relations(cannedResponses, ({ one }) => ({
    user: one(users, {
        fields: [cannedResponses.userId],
        references: [users.id],
    }),
}));
