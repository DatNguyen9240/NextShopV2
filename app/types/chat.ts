export interface ChatConversation {
    id: string
    user_id: string
    user_email: string
    user_name: string
    last_message_at: string
    unread_count_by_user: number
    unread_count_by_admin: number
    created_at: string
    last_message?: ChatMessage
}

export interface ChatMessage {
    id: string
    conversation_id: string
    sender_id: string
    sender_role: 'user' | 'admin'
    sender_name: string
    content: string
    is_read: boolean
    is_deleted?: boolean
    created_at: string
}

export interface CreateMessagePayload {
    conversation_id: string
    sender_id: string
    sender_role: 'user' | 'admin'
    sender_name: string
    content: string
}

export interface CreateConversationPayload {
    user_id: string
    user_email: string
    user_name: string
}
