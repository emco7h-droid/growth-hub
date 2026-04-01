'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { id:1, titel:'Client Info', icon:'👤', desc:'Grunddaten eintragen' },
  { id:2, titel:'Ziele setzen', icon:'🎯', desc:'3 Hauptziele definieren' },
  { id:3, titel:'Calendly', icon:'📅', desc:'Call-Link hinterlegen' },
  { id:4, titel:'Client Portal', icon:'🔐', desc:'Zugang einrichten' },
  { id:5, titel:'Fertig!', icon:'🚀', desc:'Workspace ist bereit' },
]

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wsId = searchParams.get('ws')
  const [step, setStep] = useState(1)
  const [ws, setWs] = useState(null)
  const [form, setForm] = useState({nische:'',modell:'1 zu 1',retainer:0,ziel_1:'',ziel_2:'',ziel_3:'',calendly_url:'',client_email:'',notizen:''})

  useEffect(()=>{ if(wsId) supabase.from('workspaces').select('*').eq('id',wsId).single().then(({data})=>{ if(data){setWs(data);setForm(f=>({...f,...data}))} }) },[wsId])

  const save = async () => { if(!wsId)return; await supabase.from('workspaces').update({...form,onboarding_step:step,onboarding_done:step>=4}).eq('id',wsId) }
  const next = async () => { await save(); if(step<5)setStep(s=>s+1); else router.push('/dashboard') }
  const wsColor = ws?.color||'#1565c0'

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f8fafc,#e3f0ff)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:540,background:'#fff',borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,.1)',overflow:'hidden'}}>
        <div style={{background:wsColor,padding:'22px 26px'}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,.6)',marginBottom:4}}>Workspace einrichten</div>
          <div style={{fontSize:18,fontWeight:700,color:'#fff'}}>{ws?.name||'Client'} — Schritt {step}/5</div>
          <div style={{display:'flex',gap:4,marginTop:14}}>
            {STEPS.map(s=><div key={s.id} style={{flex:1,height:3,borderRadius:2,background:s.id<=step?'rgba(255,255,255,.85)':'rgba(255,255,255,.2)',transition:'background .3s'}}/>)}
          </div>
        </div>
        <div style={{padding:'24px 26px 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <span style={{fontSize:26}}>{STEPS[step-1].icon}</span>
            <div><div style={{fontSize:16,fontWeight:600}}>{STEPS[step-1].titel}</div><div style={{fontSize:12.5,color:'#9ba1ab'}}>{STEPS[step-1].desc}</div></div>
          </div>
          {step===1&&<>
            <div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Business Coaching, Fitness, Trading..."/></div>
            <div className="fr">
              <div className="fg"><label className="fl">Modell</label><select className="fsel" value={form.modell} onChange={e=>setForm({...form,modell:e.target.value})}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Online Kurs</option></select></div>
              <div className="fg"><label className="fl">Retainer €/Mo</label><input className="fi" type="number" value={form.retainer} onChange={e=>setForm({...form,retainer:parseFloat(e.target.value)||0})} placeholder="1500"/></div>
            </div>
            <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={2}/></div>
          </>}
          {step===2&&<>
            <div style={{background:'#e3f0ff',border:'1px solid #c5d8fd',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#1565c0'}}>Was soll dieser Client in den nächsten 90 Tagen erreichen?</div>
            <div className="fg"><label className="fl">🎯 Hauptziel</label><input className="fi" value={form.ziel_1} onChange={e=>setForm({...form,ziel_1:e.target.value})} placeholder="€10.000 MRR erreichen"/></div>
            <div className="fg"><label className="fl">🎯 Ziel 2</label><input className="fi" value={form.ziel_2} onChange={e=>setForm({...form,ziel_2:e.target.value})} placeholder="10.000 Follower auf Instagram"/></div>
            <div className="fg"><label className="fl">🎯 Ziel 3</label><input className="fi" value={form.ziel_3} onChange={e=>setForm({...form,ziel_3:e.target.value})} placeholder="5 neue Kunden pro Monat"/></div>
          </>}
          {step===3&&<>
            <div className="fg"><label className="fl">Calendly URL (des Clients)</label><input className="fi" value={form.calendly_url} onChange={e=>setForm({...form,calendly_url:e.target.value})} placeholder="https://calendly.com/client-name/..."/><div style={{fontSize:11.5,color:'#9ba1ab',marginTop:4}}>Sein Calendly — nicht deiner. Damit werden seine Calls gebucht.</div></div>
            <div style={{background:'#fff8e1',border:'1px solid #fdd835',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#5c6370',lineHeight:1.7}}>Kein eigener Calendly vorhanden? Kein Problem — das kannst du später in Einstellungen eintragen.</div>
          </>}
          {step===4&&<>
            <div className="fg"><label className="fl">Client Email für Portal</label><input className="fi" type="email" value={form.client_email} onChange={e=>setForm({...form,client_email:e.target.value})} placeholder="client@beispiel.de"/><div style={{fontSize:11.5,color:'#9ba1ab',marginTop:4}}>Der Client meldet sich damit im Portal an und sieht sein Dashboard read-only.</div></div>
            <div style={{background:'#e0f5ee',border:'1px solid #a8dcc0',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#0a7c59',lineHeight:1.7}}>Nach dem Speichern: <strong>Supabase → Authentication → Invite User</strong> → Client-Email eingeben → Er bekommt einen Link per Email.</div>
          </>}
          {step===5&&<div style={{textAlign:'center',padding:'16px 0'}}>
            <div style={{fontSize:44,marginBottom:12}}>🎉</div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:8}}>{ws?.name} ist bereit!</div>
            <div style={{fontSize:13,color:'#5c6370',lineHeight:1.7,marginBottom:16}}>Jetzt Leads hinzufügen, KPIs tracken und loslegen.</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
              {[['Leads hinzufügen','/leads'],['KPIs eintragen','/kpis'],['Dashboard','/dashboard']].map(([l,h])=>(
                <a key={h} href={h} style={{padding:'8px 14px',borderRadius:7,background:`${wsColor}15`,color:wsColor,textDecoration:'none',fontSize:13,fontWeight:500,border:`1px solid ${wsColor}30`}}>{l}</a>
              ))}
            </div>
          </div>}
        </div>
        <div style={{padding:'0 26px 22px',display:'flex',justifyContent:'space-between'}}>
          {step>1?<button className="btn-s" onClick={()=>setStep(s=>s-1)}>← Zurück</button>:<div/>}
          <button className="btn-p" onClick={next} style={{background:wsColor}}>{step<5?'Weiter →':'Zum Dashboard'}</button>
        </div>
      </div>
    </div>
  )
}
export default function Onboarding(){return <Suspense fallback={<div/>}><OnboardingInner/></Suspense>}
