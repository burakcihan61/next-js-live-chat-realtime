// API Request/Response types

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Conversation API types
export interface CreateConversationRequest {
    visitorId: string;
    subject?: string;
    priority?: string;
}

export interface UpdateConversationRequest {
    status?: string;
    priority?: string;
    subject?: string;
    tags?: string[];
    rating?: number;
    feedback?: string;
}

export interface AssignConversationRequest {
    agentId: string;
}

// Message API types
export interface CreateMessageRequest {
    conversationId: string;
    content: string;
    type?: string;
    attachments?: Array<{
        url: string;
        name: string;
        type: string;
        size: number;
    }>;
}

// Visitor API types
export interface CreateVisitorRequest {
    name?: string;
    email?: string;
    sessionId: string;
    userAgent?: string;
    ipAddress?: string;
    location?: {
        country?: string;
        city?: string;
        region?: string;
    };
    metadata?: Record<string, any>;
}

export interface UpdateVisitorRequest {
    name?: string;
    email?: string;
    metadata?: Record<string, any>;
}

// Typing indicator types
export interface TypingIndicatorRequest {
    conversationId: string;
    userId: string;
    userType: 'agent' | 'visitor';
}

// Widget types
export interface WidgetInitRequest {
    sessionId: string;
}

export interface WidgetSessionResponse {
    visitorId: string;
    sessionId: string;
    conversationId?: string;
}
