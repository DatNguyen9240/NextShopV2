import { useState, useEffect, useRef, useCallback } from 'react'
import type { ChatConversation, ChatMessage } from '../types/chat'
import {
    getAllConversations,
    getMessages,
    sendMessage as sendMessageService,
    markAsRead,
    subscribeToConversations,
    subscribeToConversation,
    unsubscribe,
    trackPresence,
    deleteMessage,
} from '../services/chatService'
import { useAuth } from '../providers/AuthProvider'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useAdminChat() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<
        string | null
    >(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoadingConversations, setIsLoadingConversations] = useState(false)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const conversationsChannelRef = useRef<RealtimeChannel | null>(null)
    const messagesChannelRef = useRef<RealtimeChannel | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isUserTyping, setIsUserTyping] = useState(false)
    const [isUserOnline, setIsUserOnline] = useState(false)
    const [lastUserSeen, setLastUserSeen] = useState<Date | null>(null)

    // Load all conversations
    useEffect(() => {
        const loadConversations = async () => {
            setIsLoadingConversations(true)
            try {
                const convs = await getAllConversations()
                setConversations(convs)
            } catch (error) {
                console.error('Error loading conversations:', error)
            } finally {
                setIsLoadingConversations(false)
            }
        }

        loadConversations()
    }, [])

    // Subscribe to conversation updates
    useEffect(() => {
        const channel = subscribeToConversations((updatedConv) => {
            setConversations((prev) => {
                const index = prev.findIndex((c) => c.id === updatedConv.id)
                if (index >= 0) {
                    // Update existing conversation
                    const updated = [...prev]
                    updated[index] = { ...updated[index], ...updatedConv }
                    // Re-sort by last_message_at
                    return updated.sort(
                        (a, b) =>
                            new Date(b.last_message_at).getTime() -
                            new Date(a.last_message_at).getTime()
                    )
                } else {
                    // Add new conversation
                    return [updatedConv, ...prev]
                }
            })
        })

        conversationsChannelRef.current = channel

        return () => {
            if (conversationsChannelRef.current) {
                unsubscribe(conversationsChannelRef.current)
            }
        }
    }, [])

    // Load messages when conversation is selected
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([])
            return
        }

        const loadMessages = async () => {
            setIsLoadingMessages(true)
            try {
                const msgs = await getMessages(selectedConversationId)
                setMessages(msgs)

                // Mark as read
                await markAsRead(selectedConversationId, 'admin')
            } catch (error) {
                console.error('Error loading messages:', error)
            } finally {
                setIsLoadingMessages(false)
            }
        }

        loadMessages()
    }, [selectedConversationId])

    // Subscribe to messages and typing for selected conversation
    useEffect(() => {
        if (!selectedConversationId || !user?.id) return

        // Unsubscribe from previous channel
        if (messagesChannelRef.current) {
            unsubscribe(messagesChannelRef.current)
        }

        setIsUserTyping(false) // Reset on switch
        setIsUserOnline(false) // Reset on switch

        const channel = subscribeToConversation(selectedConversationId, {
            onMessage: (newMessage) => {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMessage.id)) {
                        return prev
                    }
                    return [...prev, newMessage]
                })

                // Mark as read if it's from user
                if (newMessage.sender_role === 'user') {
                    markAsRead(selectedConversationId, 'admin')
                    setIsUserTyping(false)
                }
            },
            onTyping: (data) => {
                if (data.sender_id !== user?.id) {
                    setIsUserTyping(data.is_typing)
                }
            },
            onPresence: (onlineIds) => {
                const userOnline = onlineIds.some(id => id !== user.id)
                setIsUserOnline(userOnline)
                if (userOnline) {
                    setLastUserSeen(new Date())
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
        })

        channel.on('presence', { event: 'sync' }, () => {
            trackPresence(channel, user.id)
        })

        messagesChannelRef.current = channel

        return () => {
            if (messagesChannelRef.current) {
                unsubscribe(messagesChannelRef.current)
            }
        }
    }, [selectedConversationId, user?.id])

    const selectConversation = useCallback((conversationId: string) => {
        setSelectedConversationId(conversationId)
    }, [])

    const setTypingStatus = useCallback((isTyping: boolean) => {
        if (!messagesChannelRef.current || !user?.id) return

        import('../services/chatService').then(service => {
            service.sendTypingStatus(messagesChannelRef.current!, {
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
            if (!selectedConversationId || !content.trim() || !user?.id) return

            setIsSending(true)
            setTypingStatus(false)
            try {
                const message = await sendMessageService({
                    conversation_id: selectedConversationId,
                    sender_id: user.id,
                    sender_role: 'admin',
                    sender_name: user.fullName || 'Admin',
                    content: content.trim(),
                })

                if (message) {
                    // Message will be added via real-time subscription
                    setMessages((prev) => {
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
        [selectedConversationId, user, setTypingStatus]
    )

    const handleDeleteMessage = useCallback(async (messageId: string) => {
        // Real-time update will handle the UI state change to "Đã gỡ"
        const success = await deleteMessage(messageId)
        if (!success) {
            console.error('Failed to delete message')
        }
    }, [])

    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            conv.user_name.toLowerCase().includes(query) ||
            conv.user_email.toLowerCase().includes(query)
        )
    })

    return {
        conversations: filteredConversations,
        selectedConversationId,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        isSending,
        isUserTyping,
        isUserOnline,
        lastUserSeen,
        searchQuery,
        selectConversation,
        sendMessage: sendMessageHandler,
        deleteMessage: handleDeleteMessage,
        handleInputChange,
        setSearchQuery,
    }
}
