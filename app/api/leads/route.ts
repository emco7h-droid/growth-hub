import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const workspaceId = req.nextUrl.searchParams.get('workspace_id')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspace_id erforderlich' }, { status: 400 })
    }

    const name = body.name || body.full_name || body.first_name || body.invitee?.name || 'Unbekannt'
    const email = body.email || body.email_address || body.invitee?.email || null
    const telefon = body.phone || body.phone_number || body.telefon || null
    const quelle = body.source || body.quelle || 'Webhook'

    const { data, error } = await supabase.from('leads').insert({
      workspace_id: workspaceId,
      name,
      email,
      telefon,
      quelle,
      status: 'Neu',
      letzte_aktivitaet: new Date().toISOString(),
    }).select().single()

    if (error) throw error

    await supabase.from('notifications').insert({
      workspace_id: workspaceId,
      typ: 'lead',
      titel: `Neuer Lead: ${name}`,
      nachricht: `${email || 'Keine Email'} · ${quelle}`,
      gelesen: false,
    })

    return NextResponse.json({ success: true, lead: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Growth Hub Webhook aktiv ✓' })
}
