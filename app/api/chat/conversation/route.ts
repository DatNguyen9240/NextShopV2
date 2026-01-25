import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key to bypass RLS on the server
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
    try {
        const payload = await request.json()

        // Create or find conversation
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('chat_conversations')
            .select('*')
            .eq('user_id', payload.user_id)
            .maybeSingle()

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        if (existing) {
            return NextResponse.json(existing)
        }

        const { data, error } = await supabaseAdmin
            .from('chat_conversations')
            .insert([payload])
            .select()
            .maybeSingle()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
