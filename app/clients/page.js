'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const empty = {name:'',email:'',nische:'',coaching_modell:'1 zu 1',retainer:0,startdatum:'',aktueller_monat:1,status:'Aktiv',ziel_1:'',ziel_2:'',ziel_3:'',bottleneck:'',quick_win:'',notizen:''}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(empty)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      load()
    })
  }, [])

  const load = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at',{ascending:false})
    setClients(data||[])
    setLoading(false)
  }

  const save = async () => {
    if (!form.name.trim()) return
    await supabase.from('clients').insert([{...form, retainer:parseFloat(form.retainer)||0}])
    setModal(false); setForm(empty); load()
  }

  const del = async (id) => {
    await supabase.from('clients').delete().eq('id',id); load()
  }

  const infoBox = (label, value) => (
    <div key={label}>
      <div style={{fontSize:11,color:'var(--text-m)',textTransform:'uppercase',fontWeight:700,marginBottom:4,fontFamily:'Syne',letterSpacing:'.06em'}}>{label}</div>
      <div style={{fontSize:14,color:'var(--text)'}}>{value||'—'}</div>
    </div>
  )

  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <div className="mc">
        <div className="tb">
          <div>
            <div className="tb-title">Clients</div>
            <div style={{fontSize:12,color:'var(--text-m)',marginTop:2}}>{clients.filter(c=>c.status==='Aktiv').length} aktive Zusammenarbeiten</div>
          </div>
          <button className="btn-p" onClick={()=>setModal(true)}>＋ Client hinzufuegen</button>
        </div>
        <div className="ct">
          {!selected ? (
            <div className="sc">
              {loading?<div className="empty">Laden...</div>:clients.length===0?<div className="empty">Noch keine Clients.</div>:
              <table>
                <thead><tr><th>Name</th><th>Nische</th><th>Modell</th><th>Retainer</th><th>Start</th><th>Fortschritt</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {clients.map(c=>(
                    <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>setSelected(c)}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,var(--purple),#c084fc)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div>
                          <span style={{fontWeight:600}}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{color:'var(--text-s)'}}>{c.nische||'—'}</td>
                      <td><span className="bdg bg-b">{c.coaching_modell}</span></td>
                      <td style={{fontWeight:700,color:'var(--green)'}}>€{(c.retainer||0).toLocaleString('de-DE')}</td>
                      <td style={{color:'var(--text-m)'}}>{c.startdatum?new Date(c.startdatum).toLocaleDateString('de-DE'):'—'}</td>
                      <td style={{minWidth:120}}>
                        <div style={{fontSize:12,color:'var(--text-s)'}}>Monat {c.aktueller_monat||1}/3</div>
                        <div className="pb" style={{width:100}}><div className="pf" style={{width:`${Math.min(100,((c.aktueller_monat||1)/3)*100)}%`}}></div></div>
                      </td>
                      <td><span className={`bdg ${c.status==='Aktiv'?'bg-g':'bg-gray'}`}>{c.status}</span></td>
                      <td onClick={e=>e.stopPropagation()}><button className="btn-g" style={{padding:'5px 10px',fontSize:12}} onClick={()=>del(c.id)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </div>
          ) : (
            <div>
              <button className="btn-g" style={{marginBottom:20}} onClick={()=>setSelected(null)}>← Zurueck zur Uebersicht</button>
              <div className="g2">
                <div className="sc">
                  <div className="ch"><span className="ct-t">👤 Client Info</span><span className={`bdg ${selected.status==='Aktiv'?'bg-g':'bg-gray'}`}>{selected.status}</span></div>
                  <div className="cb" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    {[['Name',selected.name],['Email',selected.email],['Nische',selected.nische],['Modell',selected.coaching_modell],['Retainer',`€${(selected.retainer||0).toLocaleString('de-DE')}/Mo`],['Start',selected.startdatum?new Date(selected.startdatum).toLocaleDateString('de-DE'):'—']].map(([k,v])=>infoBox(k,v))}
                  </div>
                </div>
                <div className="sc">
                  <div className="ch"><span className="ct-t">🎯 Ziele (90 Tage)</span></div>
                  <div className="cb" style={{display:'flex',flexDirection:'column',gap:12}}>
                    {[selected.ziel_1,selected.ziel_2,selected.ziel_3].filter(Boolean).map((z,i)=>(
                      <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                        <div style={{width:24,height:24,borderRadius:'50%',background:'var(--blue-1)',color:'var(--blue-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
                        <div style={{fontSize:14}}>{z}</div>
                      </div>
                    ))}
                    {!selected.ziel_1&&<div style={{color:'var(--text-m)',fontSize:13}}>Keine Ziele eingetragen</div>}
                  </div>
                </div>
                <div className="sc">
                  <div className="ch"><span className="ct-t">⚡ Bottleneck & Quick Win</span></div>
                  <div className="cb" style={{display:'flex',flexDirection:'column',gap:16}}>
                    {infoBox('Bottleneck',selected.bottleneck)}
                    {infoBox('Quick Win',selected.quick_win)}
                  </div>
                </div>
                <div className="sc">
                  <div className="ch"><span className="ct-t">📝 Notizen</span></div>
                  <div className="cb"><div style={{fontSize:14,color:selected.notizen?'var(--text)':'var(--text-m)'}}>{selected.notizen||'Keine Notizen'}</div></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {modal && (
          <div className="overlay" onClick={()=>setModal(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <h2>Neuer Client</h2>
              <div className="fr">
                <div className="fg"><label className="fl">Name*</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div className="fg"><label className="fl">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              </div>
              <div className="fr">
                <div className="fg"><label className="fl">Nische</label><input value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})}/></div>
                <div className="fg"><label className="fl">Coaching Modell</label>
                  <select value={form.coaching_modell} onChange={e=>setForm({...form,coaching_modell:e.target.value})}>
                    <option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Online Kurs</option>
                  </select>
                </div>
              </div>
              <div className="fr">
                <div className="fg"><label className="fl">Retainer (€/Mo)</label><input type="number" value={form.retainer} onChange={e=>setForm({...form,retainer:e.target.value})}/></div>
                <div className="fg"><label className="fl">Startdatum</label><input type="date" value={form.startdatum} onChange={e=>setForm({...form,startdatum:e.target.value})}/></div>
              </div>
              <div className="fg"><label className="fl">Ziel 1</label><input value={form.ziel_1} onChange={e=>setForm({...form,ziel_1:e.target.value})} placeholder="Konkretes messbares Ziel..."/></div>
              <div className="fg"><label className="fl">Ziel 2</label><input value={form.ziel_2} onChange={e=>setForm({...form,ziel_2:e.target.value})}/></div>
              <div className="fg"><label className="fl">Ziel 3</label><input value={form.ziel_3} onChange={e=>setForm({...form,ziel_3:e.target.value})}/></div>
              <div className="fg"><label className="fl">Bottleneck</label><input value={form.bottleneck} onChange={e=>setForm({...form,bottleneck:e.target.value})}/></div>
              <div className="fg"><label className="fl">Quick Win</label><input value={form.quick_win} onChange={e=>setForm({...form,quick_win:e.target.value})}/></div>
              <div className="fg"><label className="fl">Notizen</label><textarea value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
              <div className="ma">
                <button className="btn-g" onClick={()=>{setModal(false);setForm(empty)}}>Abbrechen</button>
                <button className="btn-p" onClick={save}>Client speichern</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
