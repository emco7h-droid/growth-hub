export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: body.messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return Response.json({ error: `API Fehler: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    return Response.json({ text: data.content?.[0]?.text || '' })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
