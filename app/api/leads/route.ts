import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const workspaceId = req.nextUrl.searchParams.get('workspace_id')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
    }

    // Supports OnePage.io, Typeform, GoHighLevel, generic webhooks
    const lead = {
      workspace_id: workspaceId,
      name: body.name || body.full_name || body.first_name || 'Unbekannt',
      email: body.email || body.email_address || null,
      telefon: body.phone || body.phone_number || body.telefon || null,
      unternehmen: body.company || body.unternehmen || null,
      quelle: body.source || body.quelle || 'OnePage.io',
      status: 'Neu',
      tags: body.tags || null,
      notizen: body.message || body.notizen || null,
      letzte_aktivitaet: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('leads').insert(lead).select().single()

    if (error) throw error

    // Create notification
    await supabase.from('notifications').insert({
      workspace_id: workspaceId,
      typ: 'lead',
      titel: `Neuer Lead: ${lead.name}`,
      nachricht: `${lead.email || 'Keine Email'} · Quelle: ${lead.quelle}`,
      gelesen: false,
    })

    return NextResponse.json({ success: true, lead: data })
  } catch (err: any) {
    console.error('Lead webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Growth Hub Lead Webhook aktiv' })
}
