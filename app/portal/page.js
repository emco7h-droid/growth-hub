'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Portal() {
  const [step, setStep] = useState('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ws, setWs] = useState(null)
  const [kpis, setKpis] = useState([])
  const [reports, setReports] = useState([])
  const [invoices, setInvoices] = useState([])
  const [goals, setGoals] = useState([])

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session) loadData(session.user.email)
      else setStep('login')
    })
  },[])

  const login = async () => {
    setLoading(true); setError('')
    const {data,error:err} = await supabase.auth.signInWithPassword({email,password})
    if(err){setError('Falsche Email oder Passwort.');setLoading(false);return}
    await loadData(email)
    setLoading(false)
  }

  const loadData = async (userEmail) => {
    const {data:wsData} = await supabase.from('workspaces').select('*').eq('client_email',userEmail).single()
    if(!wsData){setError('Kein Zugang gefunden.');setStep('login');return}
    setWs(wsData)
    const [k,r,i,g] = await Promise.all([
      supabase.from('kpis').select('*').eq('workspace_id',wsData.id).order('monat',{ascending:false}).limit(6),
      supabase.from('weekly_reports').select('*').eq('workspace_id',wsData.id).eq('sichtbar_fuer_client',true).order('woche_nr',{ascending:false}).limit(4),
      supabase.from('invoices').select('*').eq('workspace_id',wsData.id).eq('client_sichtbar',true).order('created_at',{ascending:false}).limit(6),
      supabase.from('workspace_goals').select('*').eq('workspace_id',wsData.id).eq('status','Aktiv').order('prioritaet').limit(4),
    ])
    setKpis(k.data||[]); setReports(r.data||[]); setInvoices(i.data||[]); setGoals(g.data||[])
    setStep('dashboard')
  }

  const logout = async () => { await supabase.auth.signOut(); setStep('login'); setWs(null) }
  const wsColor = ws?.color||'#1565c0'
  const latest = kpis[0]

  if(step==='loading') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ba1ab'}}>Laden...</div>

  if(step==='login') return (
    <div style={{minHeight:'100vh',background:`linear-gradient(135deg, ${wsColor}20, #f8fafc)`,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:16,padding:'40px 36px',width:380,boxShadow:'0 20px 60px rgba(0,0,0,.12)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:48,height:48,borderRadius:12,background:wsColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:'#fff',margin:'0 auto 12px'}}>GH</div>
          <div style={{fontSize:22,fontWeight:800,color:'#1a1a2e',marginBottom:4}}>Client Portal</div>
          <div style={{fontSize:13.5,color:'#9ba1ab'}}>Melde dich an um dein Dashboard zu sehen</div>
        </div>
        {error&&<div style={{background:'#fce8e6',border:'1px solid #f5c6c2',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#c0392b',marginBottom:16}}>{error}</div>}
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}/></div>
        <div className="fg"><label className="fl">Passwort</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}/></div>
        <button className="btn-p" onClick={login} disabled={loading} style={{width:'100%',justifyContent:'center',height:44,fontSize:15,marginTop:8,background:wsColor}}>{loading?'Anmelden...':'Anmelden →'}</button>
        <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'#c5ccd4'}}>Powered by Growth Hub</div>
      </div>
    </div>
  )

  const pct = (g) => Math.min(100,g.ziel_wert>0?Math.round(g.aktuell_wert/g.ziel_wert*100):0)

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc'}}>
      <div style={{background:wsColor,padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{ws?.name?.slice(0,2).toUpperCase()}</div>
          <span style={{fontSize:15,fontWeight:600,color:'#fff'}}>{ws?.name}</span>
          <span style={{fontSize:11.5,color:'rgba(255,255,255,.5)',background:'rgba(255,255,255,.15)',padding:'2px 8px',borderRadius:4}}>Nur Lesen</span>
        </div>
        <button onClick={logout} style={{fontSize:12,color:'rgba(255,255,255,.7)',background:'transparent',border:'1px solid rgba(255,255,255,.3)',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>Abmelden</button>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>
        {/* Goals progress */}
        {goals.length>0&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,marginBottom:20}}>
            {goals.map(g=>{
              const p=pct(g)
              return <div key={g.id} style={{background:'#fff',borderRadius:12,padding:'16px 18px',border:'1px solid #e1e4e8'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontSize:13.5,fontWeight:600}}>{g.titel}</span>
                  <span style={{fontSize:13,fontWeight:700,color:p>=100?'#0a7c59':wsColor}}>{p}%</span>
                </div>
                <div style={{height:6,background:'#f0f2f5',borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${p}%`,height:'100%',background:p>=100?'#0a7c59':wsColor,borderRadius:3,transition:'width .5s'}}/>
                </div>
                <div style={{fontSize:11.5,color:'#9ba1ab',marginTop:4}}>{g.aktuell_wert}{g.einheit} / {g.ziel_wert}{g.einheit}</div>
              </div>
            })}
          </div>
        )}

        {/* KPI Cards */}
        {latest&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {[
              ['MRR',latest.mrr||latest.umsatz>0?`€${(latest.mrr||latest.umsatz)?.toLocaleString('de-DE')}`:'—','💰'],
              ['Neue Kunden',latest.neue_kunden||'—','👥'],
              ['Close Rate',latest.close_rate>0?`${latest.close_rate}%`:'—','🎯'],
              ['Instagram',latest.follower_ig>0?latest.follower_ig?.toLocaleString('de-DE'):'—','📸'],
            ].map(([l,v,ic])=>(
              <div key={l} style={{background:'#fff',borderRadius:12,padding:'16px 18px',border:'1px solid #e1e4e8'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div><div style={{fontSize:11.5,color:'#9ba1ab',marginBottom:6}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:'#1a1a2e'}}>{v}</div></div>
                  <span style={{fontSize:22}}>{ic}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {/* Reports */}
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e1e4e8',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid #f0f2f5'}}><div style={{fontSize:14,fontWeight:600}}>Wochen Updates</div></div>
            <div style={{padding:'8px 18px 16px'}}>
              {reports.length===0?<div style={{padding:'16px 0',fontSize:13,color:'#9ba1ab',textAlign:'center'}}>Noch keine Updates</div>:
              reports.map((r,i)=>(
                <div key={r.id} style={{padding:'12px 0',borderBottom:i<reports.length-1?'1px solid #f0f2f5':'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:600}}>KW {r.woche_nr}</span>
                    {r.umsatz_woche>0&&<span style={{fontSize:12,fontWeight:700,color:'#0a7c59'}}>€{r.umsatz_woche?.toLocaleString('de-DE')}</span>}
                  </div>
                  {r.was_lief_gut&&<div style={{fontSize:12.5,color:'#5c6370',marginBottom:2}}>✅ {r.was_lief_gut}</div>}
                  {r.plan_naechste_woche&&<div style={{fontSize:12.5,color:'#1565c0'}}>→ {r.plan_naechste_woche}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Invoices with Stripe */}
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e1e4e8',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid #f0f2f5'}}><div style={{fontSize:14,fontWeight:600}}>Rechnungen</div></div>
            <div style={{padding:'8px 18px 16px'}}>
              {invoices.length===0?<div style={{padding:'16px 0',fontSize:13,color:'#9ba1ab',textAlign:'center'}}>Keine Rechnungen</div>:
              invoices.map((inv,i)=>(
                <div key={inv.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<invoices.length-1?'1px solid #f0f2f5':'none'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500}}>{inv.beschreibung}</div>
                    <div style={{fontSize:11.5,color:'#9ba1ab'}}>{inv.faellig?new Date(inv.faellig).toLocaleDateString('de-DE'):'—'}</div>
                  </div>
                  <span style={{fontSize:13,fontWeight:700}}>€{inv.betrag?.toLocaleString('de-DE')}</span>
                  {inv.status==='Ausstehend'&&inv.stripe_payment_url?(
                    <a href={inv.stripe_payment_url} target="_blank" style={{fontSize:11,padding:'3px 10px',borderRadius:5,background:wsColor,color:'#fff',textDecoration:'none',fontWeight:600,whiteSpace:'nowrap'}}>💳 Jetzt zahlen</a>
                  ):(
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:5,background:inv.status==='Bezahlt'?'#e0f5ee':'#fff8e1',color:inv.status==='Bezahlt'?'#0a7c59':'#b7860b',fontWeight:600}}>{inv.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{marginTop:16,background:'#f0f9ff',border:'1px solid #c5d8fd',borderRadius:10,padding:'14px 18px',fontSize:13,color:'#1565c0',textAlign:'center',lineHeight:1.6}}>
          Bei Fragen wende dich direkt an dein Growth Hub Team. Dieses Dashboard wird laufend aktualisiert.
        </div>
      </div>
    </div>
  )
}
