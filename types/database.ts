import { users, visitors, conversations, messages, typingIndicators } from '@/drizzle/schema';

// Infer types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Visitor = typeof visitors.$inferSelect;
export type NewVisitor = typeof visitors.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type TypingIndicator = typeof typingIndicators.$inferSelect;
export type NewTypingIndicator = typeof typingIndicators.$inferInsert;

// Extended types with relations
export type ConversationWithRelations = Conversation & {
    visitor: Visitor;
    assignedAgent?: User | null;
    messages: Message[];
};

export type MessageWithSender = Message & {
    sender: User | Visitor;
};

// Status types
export type UserStatus = 'online' | 'offline' | 'away';
export type ConversationStatus = 'pending' | 'active' | 'resolved' | 'closed';
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageType = 'text' | 'file' | 'image' | 'system';
export type SenderType = 'agent' | 'visitor';
export type UserRole = 'admin' | 'agent';
