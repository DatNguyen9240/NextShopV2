import { supabase } from '../lib/supabaseClient'
import type {
    ChatConversation,
    ChatMessage,
    CreateMessagePayload,
    CreateConversationPayload,
} from '../types/chat'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Get or create a conversation for a user
 */
export async function getOrCreateConversation(
    payload: CreateConversationPayload
): Promise<ChatConversation | null> {
    try {
        // Use our API proxy to create/get conversation securely
        const response = await fetch('/api/chat/conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Error in getOrCreateConversation API:', error)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error('Exception in getOrCreateConversation:', error)
        return null
    }
}

/**
 * Get all conversations (admin only)
 */
export async function getAllConversations(): Promise<ChatConversation[]> {
    try {
        const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .order('last_message_at', { ascending: false })

        if (error) {
            // console.error('Error fetching conversations:', error)
            return []
        }

        // Fetch last message for each conversation
        const conversationsWithLastMessage = await Promise.all(
            data.map(async (conv) => {
                const { data: lastMsg } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                return {
                    ...conv,
                    last_message: lastMsg || undefined,
                }
            })
        )

        return conversationsWithLastMessage
    } catch {
        // console.error('Error in getAllConversations:', error)
        return []
    }
}

/**
 * Get conversation by ID
 */
export async function getConversationById(
    conversationId: string
): Promise<ChatConversation | null> {
    try {
        const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('id', conversationId)
            .maybeSingle()

        if (error) {
            // console.error('Error fetching conversation:', error)
            return null
        }

        return data
    } catch {
        // console.error('Error in getConversationById:', error)
        return null
    }
}

/**
 * Get messages for a conversation with pagination
 */
export async function getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ChatMessage[]> {
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            // console.error('Error fetching messages:', error)
            return []
        }

        // Return in ascending order (oldest first)
        return data.reverse()
    } catch {
        // console.error('Error in getMessages:', error)
        return []
    }
}

/**
 * Send a message
 */
export async function sendMessage(
    payload: CreateMessagePayload
): Promise<ChatMessage | null> {
    try {
        // Use our API proxy to send message securely
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Error in sendMessage API:', error)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error('Error in sendMessage:', error)
        return null
    }
}

/**
 * Mark messages as read
 */
export async function markAsRead(
    conversationId: string,
    role: 'user' | 'admin'
): Promise<boolean> {
    try {
        // Use our API proxy to mark messages as read securely
        const response = await fetch('/api/chat/message', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, role }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Error in markAsRead API:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in markAsRead:', error)
        return false
    }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/chat/message?id=${messageId}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            let errorData
            try {
                errorData = await response.json()
            } catch {
                errorData = await response.text()
            }
            console.error(`Error in deleteMessage API (Status ${response.status}):`, errorData)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in deleteMessage:', error)
        return false
    }
}


/**
 * Subscribe to new messages, typing status, and presence in a conversation
 */
export function subscribeToConversation(
    conversationId: string,
    callbacks: {
        onMessage: (message: ChatMessage) => void
        onMessageUpdate?: (message: ChatMessage) => void
        onMessageDelete?: (messageId: string) => void
        onTyping?: (data: { sender_id: string; is_typing: boolean }) => void
        onPresence?: (onlineUsers: string[]) => void
    }
): RealtimeChannel {
    const channel = supabase.channel(`conversation:${conversationId}`, {
        config: {
            presence: {
                key: conversationId,
            },
        },
    })

    channel
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                callbacks.onMessage(payload.new as ChatMessage)
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                if (callbacks.onMessageUpdate) {
                    callbacks.onMessageUpdate(payload.new as ChatMessage)
                }
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                if (callbacks.onMessageDelete) {
                    callbacks.onMessageDelete(payload.old.id)
                }
            }
        )
        .on('broadcast', { event: 'typing' }, (payload) => {
            if (callbacks.onTyping) {
                callbacks.onTyping(payload.payload)
            }
        })
        .on('presence', { event: 'sync' }, () => {
            if (callbacks.onPresence) {
                const state = channel.presenceState()
                // console.log('Presence State:', state)
                const onlineIds = Object.values(state)
                    .flat()
                    .map((p: Record<string, unknown>) => p.user_id as string)
                // console.log('Online IDs:', onlineIds)
                callbacks.onPresence(onlineIds)
            }
        })
        .on('presence', { event: 'join' }, () => {
            // console.log('Joined:', newPresences)
        })
        .on('presence', { event: 'leave' }, () => {
            // console.log('Left:', leftPresences)
        })
        .subscribe()

    return channel
}

/**
 * Track presence for a user in a channel
 */
export async function trackPresence(
    channel: RealtimeChannel,
    userId: string,
    data: Record<string, unknown> = {}
) {
    await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        ...data,
    })
}


/**
 * Send typing status via broadcast
 */
export async function sendTypingStatus(
    channel: RealtimeChannel,
    data: { sender_id: string; is_typing: boolean }
) {
    await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: data,
    })
}

/**
 * Subscribe to conversation updates (for admin)
 */
export function subscribeToConversations(
    onUpdate: (conversation: ChatConversation) => void
): RealtimeChannel {
    const channel = supabase
        .channel('conversations')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'chat_conversations',
            },
            (payload) => {
                if (payload.new) {
                    onUpdate(payload.new as ChatConversation)
                }
            }
        )
        .subscribe()

    return channel
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
    await supabase.removeChannel(channel)
}

