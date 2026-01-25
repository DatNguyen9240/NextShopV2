import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatMessage } from '../types/chat'
import {
    getOrCreateConversation,
    getMessages,
    sendMessage as sendMessageService,
    markAsRead,
    subscribeToConversation,
    unsubscribe,
    trackPresence,
    deleteMessage,
} from '../services/chatService'
import { useAuth } from '../providers/AuthProvider'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useChatWidget() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isAdminTyping, setIsAdminTyping] = useState(false)
    const [isAdminOnline, setIsAdminOnline] = useState(false)
    const [lastAdminSeen, setLastAdminSeen] = useState<Date | null>(null)

    const hasFetched = useRef(false)
    // Initialize conversation
    useEffect(() => {
        if (!user?.id || hasFetched.current) return
        hasFetched.current = true

        const initConversation = async () => {
            setIsLoading(true)
            try {
                const conversation = await getOrCreateConversation({
                    user_id: user.id,
                    user_email: user.email,
                    user_name: user.fullName || 'User',
                })

                if (conversation) {
                    setConversationId(conversation.id)
                    setUnreadCount(conversation.unread_count_by_user)

                    // Load messages
                    const msgs = await getMessages(conversation.id)
                    setMessages(msgs)
                }
            } catch (error) {
                console.error('Error initializing conversation:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initConversation()
    }, [user])

    // Subscribe to real-time messages, typing status, and presence
    useEffect(() => {
        if (!conversationId || !user?.id) return

        const channel = subscribeToConversation(conversationId, {
            onMessage: (newMessage) => {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMessage.id)) {
                        return prev
                    }
                    return [...prev, newMessage]
                })

                // Increment unread count if widget is closed and message is from admin
                if (!isOpen && newMessage.sender_role === 'admin') {
                    setUnreadCount((prev) => prev + 1)
                }

                // Clear typing indicator when message arrives
                if (newMessage.sender_role === 'admin') {
                    setIsAdminTyping(false)
                }
            },
            onTyping: (data) => {
                // Only care about admin typing
                if (data.sender_id !== user?.id) {
                    setIsAdminTyping(data.is_typing)
                }
            },
            onMessageUpdate: (updatedMessage) => {
                setMessages((prev) =>
                    prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
                )
            },
            onMessageDelete: (deletedMessageId) => {
                setMessages((prev) => prev.filter((m) => m.id !== deletedMessageId))
            },
            onPresence: (onlineIds) => {
                const adminOnline = onlineIds.some(id => id !== user.id)
                setIsAdminOnline(adminOnline)
                if (adminOnline) {
                    setLastAdminSeen(new Date())
                }
            }
        })

        channel.on('presence', { event: 'sync' }, () => {
            // Track our own presence
            trackPresence(channel, user.id)
        })

        channelRef.current = channel

        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current)
            }
        }
    }, [conversationId, isOpen, user?.id])


    // Mark as read when opening widget
    useEffect(() => {
        if (isOpen && conversationId && unreadCount > 0) {
            markAsRead(conversationId, 'user').then((success) => {
                if (success) {
                    setUnreadCount(0)
                }
            })
        }
    }, [isOpen, conversationId, unreadCount])

    const toggleWidget = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const setTypingStatus = useCallback((isTyping: boolean) => {
        if (!channelRef.current || !user?.id) return

        import('../services/chatService').then(service => {
            service.sendTypingStatus(channelRef.current!, {
                sender_id: user.id,
                is_typing: isTyping
            })
        })
    }, [user?.id])

    const handleInputChange = useCallback(() => {
        setTypingStatus(true)

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(false)
        }, 3000)
    }, [setTypingStatus])

    const sendMessageHandler = useCallback(
        async (content: string) => {
            if (!conversationId || !content.trim() || !user?.id) return

            setIsSending(true)
            setTypingStatus(false)
            try {
                const message = await sendMessageService({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    sender_role: 'user',
                    sender_name: user.fullName || 'User',
                    content: content.trim(),
                })

                if (message) {
                    // Message will be added via real-time subscription
                    // But we can add it optimistically for better UX
                    setMessages((prev) => {
                        // Check if message already exists (from subscription)
                        if (prev.some((m) => m.id === message.id)) {
                            return prev
                        }
                        return [...prev, message]
                    })
                }
            } catch (error) {
                console.error('Error sending message:', error)
            } finally {
                setIsSending(false)
            }
        },
        [conversationId, user, setTypingStatus]
    )

    const handleDeleteMessage = useCallback(async (messageId: string) => {
        // Just call the API. The REAL-TIME update will handle the UI state 
        // through the onMessageUpdate callback in subscribeToConversation.
        // If we filter here, it will disappear because we are now doing SOF-DELETE.
        const success = await deleteMessage(messageId)
        if (!success) {
            console.error('Failed to delete message')
        }
    }, [])

    return {
        isOpen,
        messages,
        unreadCount,
        isLoading,
        isSending,
        isAdminTyping,
        isAdminOnline,
        lastAdminSeen,
        toggleWidget,
        sendMessage: sendMessageHandler,
        deleteMessage: handleDeleteMessage,
        handleInputChange,
    }
}
