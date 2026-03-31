'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const empty = { nummer:'', beschreibung:'Growth Operator Retainer', betrag:0, datum:'', faellig:'', status:'Ausstehend', zahlungsart:'Stripe', stripe_payment_url:'', client_sichtbar:true }

function InvoicesContent() {
  const { current } = useWorkspace()
  const [invoices, setInvoices] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const router = useRouter()

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])
  useEffect(()=>{ if(current) load() },[current?.id])

  const load = async () => {
    const { data } = await supabase.from('invoices').select('*').eq('workspace_id',current.id).order('created_at',{ascending:false})
    setInvoices(data||[])
  }

  const save = async () => {
    if(!form.betrag)return
    const nr = form.nummer || `INV-${new Date().getFullYear()}-${String(invoices.length+1).padStart(3,'0')}`
    const payload = {...form, nummer:nr, betrag:parseFloat(form.betrag)||0, workspace_id:current.id}
    if(editId) await supabase.from('invoices').update(payload).eq('id',editId)
    else await supabase.from('invoices').insert([payload])
    setModal(false); setEditId(null); setForm(empty); load()
  }

  const updateStatus = async (id, status) => { await supabase.from('invoices').update({status}).eq('id',id); load() }
  const del = async (id) => { if(!confirm('Loeschen?'))return; await supabase.from('invoices').delete().eq('id',id); load() }
  const openEdit = (inv) => { setEditId(inv.id); setForm({...empty,...inv}); setModal(true) }

  const wsColor = current?.color||'#1565c0'
  const gesamt = invoices.reduce((s,i)=>s+(i.betrag||0),0)
  const bezahlt = invoices.filter(i=>i.status==='Bezahlt').reduce((s,i)=>s+(i.betrag||0),0)
  const ausstehend = invoices.filter(i=>i.status==='Ausstehend').reduce((s,i)=>s+(i.betrag||0),0)

  if(!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[['Gesamt',gesamt,'#1a1a2e'],['Bezahlt',bezahlt,'#0a7c59'],['Ausstehend',ausstehend,'#b7860b']].map(([l,v,c])=>(
          <div key={l} className="card" style={{borderTop:`3px solid ${c}`}}>
            <div className="cb"><div style={{fontSize:11.5,color:'#9ba1ab',marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:c}}>€{v.toLocaleString('de-DE')}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        {invoices.length===0 ? <div className="empty"><p>Noch keine Rechnungen. Erstelle die erste Rechnung.</p></div> : (
          <div className="tw"><table>
            <thead><tr><th>Nr.</th><th>Beschreibung</th><th>Betrag</th><th>Fällig</th><th>Status</th><th>Zahlung</th><th></th></tr></thead>
            <tbody>{invoices.map(inv=>(
              <tr key={inv.id}>
                <td style={{fontWeight:600,fontSize:12}}>{inv.nummer}</td>
                <td>{inv.beschreibung}</td>
                <td style={{fontWeight:700,color:'#0a7c59'}}>€{inv.betrag?.toLocaleString('de-DE')}</td>
                <td style={{fontSize:12,color:'#9ba1ab'}}>{inv.faellig?new Date(inv.faellig).toLocaleDateString('de-DE'):'—'}</td>
                <td>
                  <select value={inv.status} onChange={e=>updateStatus(inv.id,e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,fontFamily:'inherit',cursor:'pointer',outline:'none',color:inv.status==='Bezahlt'?'#0a7c59':inv.status==='Ausstehend'?'#b7860b':'#c0392b',fontWeight:600}}>
                    <option>Ausstehend</option><option>Bezahlt</option><option>Überfällig</option><option>Storniert</option>
                  </select>
                </td>
                <td>
                  {inv.stripe_payment_url ? (
                    <a href={inv.stripe_payment_url} target="_blank" style={{fontSize:11.5,color:'#1565c0',textDecoration:'none',background:'#e3f0ff',padding:'2px 8px',borderRadius:4,fontWeight:600}}>💳 Bezahlen</a>
                  ) : <span style={{fontSize:11.5,color:'#c5ccd4'}}>{inv.zahlungsart||'—'}</span>}
                </td>
                <td>
                  <div style={{display:'flex',gap:4}}>
                    <button onClick={()=>openEdit(inv)} className="btn-s" style={{height:24,padding:'0 8px',fontSize:11}}>✏️</button>
                    <button onClick={()=>del(inv.id)} className="btn-s" style={{height:24,padding:'0 8px',fontSize:11}}>×</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {modal&&<div className="mo" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>
        <div className="md" onClick={e=>e.stopPropagation()}>
          <div className="mh"><span className="mt">{editId?'Rechnung bearbeiten':'Neue Rechnung'}</span><span className="mx" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>×</span></div>
          <div className="mb">
            <div className="fr">
              <div className="fg"><label className="fl">Rechnungsnummer</label><input className="fi" value={form.nummer} onChange={e=>setForm({...form,nummer:e.target.value})} placeholder="Auto"/></div>
              <div className="fg"><label className="fl">Betrag (€) *</label><input className="fi" type="number" value={form.betrag} onChange={e=>setForm({...form,betrag:e.target.value})}/></div>
            </div>
            <div className="fg"><label className="fl">Beschreibung</label><input className="fi" value={form.beschreibung} onChange={e=>setForm({...form,beschreibung:e.target.value})}/></div>
            <div className="fr">
              <div className="fg"><label className="fl">Datum</label><input className="fi" type="date" value={form.datum} onChange={e=>setForm({...form,datum:e.target.value})}/></div>
              <div className="fg"><label className="fl">Fällig am</label><input className="fi" type="date" value={form.faellig} onChange={e=>setForm({...form,faellig:e.target.value})}/></div>
            </div>
            <div className="fr">
              <div className="fg"><label className="fl">Zahlungsart</label><select className="fsel" value={form.zahlungsart} onChange={e=>setForm({...form,zahlungsart:e.target.value})}><option>Stripe</option><option>Überweisung</option><option>PayPal</option><option>Bar</option></select></div>
              <div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Ausstehend</option><option>Bezahlt</option><option>Überfällig</option></select></div>
            </div>
            <div className="fg">
              <label className="fl">Stripe Payment Link</label>
              <input className="fi" value={form.stripe_payment_url||''} onChange={e=>setForm({...form,stripe_payment_url:e.target.value})} placeholder="https://buy.stripe.com/..."/>
              <div style={{fontSize:11.5,color:'#9ba1ab',marginTop:4}}>Erstelle den Link in Stripe → Payment Links und trage ihn hier ein. Der Client sieht dann einen "Bezahlen" Button im Portal.</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0'}}>
              <div onClick={()=>setForm({...form,client_sichtbar:!form.client_sichtbar})} style={{width:36,height:20,borderRadius:10,background:form.client_sichtbar?wsColor:'#e1e4e8',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                <div style={{width:16,height:16,borderRadius:'50%',background:'#fff',position:'absolute',top:2,left:form.client_sichtbar?18:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
              </div>
              <span style={{fontSize:13}}>Im Client Portal sichtbar</span>
            </div>
          </div>
          <div className="mf"><button className="btn-s" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>Abbrechen</button><button className="btn-p" onClick={save} style={{background:wsColor}}>Speichern</button></div>
        </div>
      </div>}
    </div>
  )
}

export default function Invoices(){return <WorkspaceProvider><div className="layout"><Sidebar/>
  <div className="main">
    <div className="topbar"><div className="tb-l"><span className="tb-title">Rechnungen</span><InvBadge/></div><div className="tb-r"><button className="btn-p" onClick={()=>{}}>+ Neue Rechnung</button></div></div>
    <InvoicesContent/>
  </div>
</div></WorkspaceProvider>}
function InvBadge(){const {current}=useWorkspace();return current?<span className="tb-ws-badge">{current.name}</span>:null}
