import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
    try {
        const payload = await request.json()

        // 1. Insert message
        const { data: message, error: messageError } = await supabaseAdmin
            .from('chat_messages')
            .insert([payload])
            .select()
            .single()

        if (messageError) {
            return NextResponse.json({ error: messageError.message }, { status: 500 })
        }

        // 2. Update conversation metadata (unread counts and last_message_at)
        const unreadField =
            payload.sender_role === 'user'
                ? 'unread_count_by_admin'
                : 'unread_count_by_user'

        // Use RPC or manual fetch-update for unread count
        // For simplicity and atomicity on server, we can use a raw update or just fetch-update
        const { data: conv } = await supabaseAdmin
            .from('chat_conversations')
            .select(unreadField)
            .eq('id', payload.conversation_id)
            .single()

        const currentCount = conv ? (conv as { [key: string]: number })[unreadField] : 0

        const { error: updateError } = await supabaseAdmin
            .from('chat_conversations')
            .update({
                last_message_at: new Date().toISOString(),
                [unreadField]: currentCount + 1,
            })
            .eq('id', payload.conversation_id)

        if (updateError) {
            console.error('Error updating conversation metadata:', updateError)
        }

        return NextResponse.json(message)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

// Route to mark as read
export async function PATCH(request: Request) {
    try {
        const { conversationId, role } = await request.json()

        // Mark as read
        const { error: messagesError } = await supabaseAdmin
            .from('chat_messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('is_read', false)
            .neq('sender_role', role)

        if (messagesError) {
            return NextResponse.json({ error: messagesError.message }, { status: 500 })
        }

        // Reset unread count for the target role
        const unreadField =
            role === 'user' ? 'unread_count_by_user' : 'unread_count_by_admin'

        const { error: conversationError } = await supabaseAdmin
            .from('chat_conversations')
            .update({ [unreadField]: 0 })
            .eq('id', conversationId)

        if (conversationError) {
            return NextResponse.json({ error: conversationError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

// Route to delete message
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const messageId = searchParams.get('id')

        if (!messageId) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
        }

        const { data: message, error: fetchError } = await supabaseAdmin
            .from('chat_messages')
            .select('created_at')
            .eq('id', messageId)
            .single()

        if (fetchError || !message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 })
        }

        // Check if message was sent today
        const createdAt = new Date(message.created_at)
        const today = new Date()

        const isToday =
            createdAt.getDate() === today.getDate() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getFullYear() === today.getFullYear()

        if (!isToday) {
            return NextResponse.json({ error: 'Chỉ có thể gỡ tin nhắn trong ngày' }, { status: 403 })
        }

        const { error } = await supabaseAdmin
            .from('chat_messages')
            .update({
                content: 'Tin nhắn đã được gỡ',
                is_deleted: true
            })
            .eq('id', messageId)

        if (error) {
            console.error('Supabase update error:', error)
            return NextResponse.json({
                error: error.message || 'Unknown update error',
                code: error.code
            }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Delete message error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
    }
}
