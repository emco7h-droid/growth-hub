'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const STATUSES = ['Ausstehend','In Kontakt','Qualifiziert','Call gebucht','Gewonnen','Verloren','No Show']
const STATUS_COLORS = {'Ausstehend':'bg-a','In Kontakt':'bg-b','Qualifiziert':'bg-p','Call gebucht':'bg-b','Gewonnen':'bg-g','Verloren':'bg-r','No Show':'bg-gray'}
const empty = {name:'',email:'',nische:'',quelle:'',status:'Ausstehend',retainer_wert:0,notizen:'',tags:''}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [filter, setFilter] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      load()
    })
  }, [])

  const load = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at',{ascending:false})
    setLeads(data||[])
    setLoading(false)
  }

  const save = async () => {
    if (!form.name.trim()) return
    await supabase.from('leads').insert([{...form, retainer_wert: parseFloat(form.retainer_wert)||0}])
    setModal(false); setForm(empty); load()
  }

  const upd = async (id, status) => {
    await supabase.from('leads').update({status}).eq('id',id); load()
  }

  const del = async (id) => {
    await supabase.from('leads').delete().eq('id',id); load()
  }

  const filtered = leads.filter(l => {
    const matchSearch = !filter || l.name?.toLowerCase().includes(filter.toLowerCase()) || l.email?.toLowerCase().includes(filter.toLowerCase())
    const matchStatus = !filterStatus || l.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <div className="mc">
        <div className="tb">
          <div>
            <div className="tb-title">Leads</div>
            <div style={{fontSize:12,color:'var(--text-m)',marginTop:2}}>Vollstaendige Uebersicht aller Leads · {leads.length} gesamt</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div className="sb-bar" style={{width:220}}>
              <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="🔍 Suchen..." style={{border:'none',background:'transparent',padding:0,fontSize:13}} />
            </div>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:160,padding:'9px 12px',fontSize:13,borderRadius:10}}>
              <option value="">Alle Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-p" onClick={()=>setModal(true)}>＋ Lead hinzufuegen</button>
          </div>
        </div>
        <div className="ct">
          <div className="sc">
            {loading ? <div className="empty">Laden...</div> : filtered.length === 0 ? <div className="empty">Keine Leads gefunden.</div> :
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Nische</th><th>Quelle</th><th>Wert</th><th>Status</th><th>Aktion</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,var(--blue-4),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13.5}}>{l.name}</div>
                          {l.tags && <div style={{fontSize:11,color:'var(--text-m)'}}>{l.tags}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{color:'var(--text-s)'}}>{l.email||'—'}</td>
                    <td>{l.nische||'—'}</td>
                    <td><span className="bdg bg-b">{l.quelle||'—'}</span></td>
                    <td style={{fontWeight:700}}>{l.retainer_wert?`€${l.retainer_wert.toLocaleString('de-DE')}`:'—'}</td>
                    <td>
                      <select value={l.status} onChange={e=>upd(l.id,e.target.value)} style={{width:140,padding:'6px 10px',fontSize:12,borderRadius:8}}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn-g" style={{padding:'5px 10px',fontSize:12}} onClick={()=>del(l.id)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        </div>
        {modal && (
          <div className="overlay" onClick={()=>setModal(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <h2>Neuer Lead</h2>
              <div className="fr">
                <div className="fg"><label className="fl">Name*</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Max Mustermann"/></div>
                <div className="fg"><label className="fl">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="max@mail.de"/></div>
              </div>
              <div className="fr">
                <div className="fg"><label className="fl">Nische</label><input value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Trading, Fitness..."/></div>
                <div className="fg"><label className="fl">Quelle</label>
                  <select value={form.quelle} onChange={e=>setForm({...form,quelle:e.target.value})}>
                    <option value="">Quelle waehlen</option>
                    <option>Calendly</option><option>Instagram DM</option><option>TikTok</option><option>YouTube</option><option>Empfehlung</option><option>Kalt Akquise</option>
                  </select>
                </div>
              </div>
              <div className="fr">
                <div className="fg"><label className="fl">Wert (€)</label><input type="number" value={form.retainer_wert} onChange={e=>setForm({...form,retainer_wert:e.target.value})} placeholder="1500"/></div>
                <div className="fg"><label className="fl">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg"><label className="fl">Tags</label><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Calendly, Follow Up, Outbound..."/></div>
              <div className="fg"><label className="fl">Notizen</label><textarea value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3} placeholder="Wichtige Infos..."/></div>
              <div className="ma">
                <button className="btn-g" onClick={()=>setModal(false)}>Abbrechen</button>
                <button className="btn-p" onClick={save}>Lead speichern</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
