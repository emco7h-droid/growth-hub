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

    // Extract lead data from any source (OnePage.io, Calendly, Typeform, etc.)
    const name = body.name || body.full_name || body.first_name || body.invitee?.name || [body.vorname, body.nachname].filter(Boolean).join(' ') || 'Unbekannt'
    const email = body.email || body.email_address || body.invitee?.email || null
    const telefon = body.phone || body.phone_number || body.telefon || body.tel || null
    const quelle = body.source || body.quelle || 'Onepage.io'
    const notizen = body.message || body.nachricht || body.notizen || null

    // Auto-assign first pipeline stage for this workspace
    const { data: stages } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('reihenfolge', { ascending: true })
      .limit(1)

    const firstStage = stages?.[0] || null

    // Create lead with auto-assigned stage
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        workspace_id: workspaceId,
        name,
        email,
        telefon,
        quelle,
        notizen,
        status: 'Neu',
        stage_id: firstStage?.id || null,
        letzte_aktivitaet: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for admin
    await supabase.from('notifications').insert({
      workspace_id: workspaceId,
      typ: 'lead',
      titel: `Neuer Lead: ${name}`,
      nachricht: `${email || 'Keine Email'} · ${quelle}${firstStage ? ` · Stage: ${firstStage.name}` : ''}`,
      gelesen: false,
    })

    // Get workspace info for Make webhook (Klaviyo, follow-up etc.)
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    // Trigger Make webhook if configured (for Klaviyo + follow-up automation)
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL
    if (makeWebhookUrl && email) {
      try {
        await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: lead.id,
            name,
            email,
            telefon,
            quelle,
            workspace_id: workspaceId,
            workspace_name: workspace?.name,
            stage: firstStage?.name || 'Neu',
            calendly_url: workspace?.calendly_url,
            klaviyo_list_id: null, // Set per client in email sequences
          }),
        })
      } catch (e) {
        // Make webhook failure shouldn't break lead creation
        console.error('Make webhook error:', e)
      }
    }

    return NextResponse.json({ 
      success: true, 
      lead,
      stage_assigned: firstStage?.name || null
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Growth Hub Webhook aktiv ✓' })
}
