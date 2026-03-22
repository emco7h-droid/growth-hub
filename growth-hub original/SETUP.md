# Growth Hub - Setup Anleitung

## Schritt 1: Supabase einrichten

1. Geh auf supabase.com und logge dich ein
2. Klick auf "New Project" und erstell ein neues Projekt
3. Geh zu "SQL Editor" und fuehre den Inhalt von `supabase-setup.sql` aus
4. Geh zu "Settings" → "API" und kopiere:
   - Project URL
   - anon public key

## Schritt 2: Environment Variables

Erstell eine Datei `.env.local` mit folgendem Inhalt:
```
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_anon_key
```

## Schritt 3: Auf Vercel deployen

1. Erstell ein GitHub Repository und pushe diesen Code rein
2. Geh auf vercel.com und klick auf "New Project"
3. Waehle dein GitHub Repository aus
4. Bei "Environment Variables" trag deine Supabase Keys ein
5. Klick auf "Deploy"

Nach dem Deploy hast du deine Website unter einer .vercel.app URL.

## Was die Website kann:
- Dashboard mit allen wichtigen Zahlen
- Leads verwalten mit Status-Tracking
- Clients mit vollstaendigem Profil und Zielen
- KPI Tracker pro Client und Monat
- 7-Tage Email Sequenz Uebersicht
- Alle Calendly Links auf einen Blick
