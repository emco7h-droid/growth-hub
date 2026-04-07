import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Workspace = {
  id: string
  name: string
  slug: string | null
  nische: string | null
  retainer: number
  status: string
  client_email: string | null
  calendly_url: string | null
  color: string
  start_date: string | null
  notizen: string | null
}

export type Lead = {
  id: string
  workspace_id: string
  name: string
  email: string | null
  telefon: string | null
  unternehmen: string | null
  status: string
  stage_id: string | null
  quelle: string
  deal_wert: number
  tags: string | null
  notizen: string | null
  created_at: string
  letzte_aktivitaet: string | null
}

export type PipelineStage = {
  id: string
  workspace_id: string
  name: string
  farbe: string
  reihenfolge: number
  ist_gewonnen: boolean
  ist_verloren: boolean
}

export type ContentItem = {
  id: string
  workspace_id: string
  titel: string
  inhalt: string | null
  plattform: string
  content_typ: string
  geplant_fuer: string | null
  status: string
  hashtags: string | null
  notizen: string | null
  bild_url: string | null
  created_at: string
}

export type AutomationRule = {
  id: string
  workspace_id: string
  stage_id: string
  trigger_event: string
  action_type: string
  action_config: Record<string, unknown>
  aktiv: boolean
}
