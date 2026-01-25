'use client'

import { ChatWidget } from './chat/ChatWidget'
import { useAuth } from '../providers/AuthProvider'

export function ChatWidgetWrapper() {
    const { user, isAuthenticated } = useAuth()

    // Only show chat widget for authenticated users with 'User' role
    if (!isAuthenticated || user?.role !== 'User') {
        return null
    }

    return <ChatWidget />
}
