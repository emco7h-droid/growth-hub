'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const STAGES = ['Neu','In Kontakt','Qualifiziert','Call gebucht','Angebot','Gewonnen','Verloren']
const STAGE_COLORS = {'Neu':'#e3e3e3','In Kontakt':'#bae6fd','Qualifiziert':'#c4b5fd','Call gebucht':'#93c5fd','Angebot':'#fde68a','Gewonnen':'#86efac','Verloren':'#fca5a5'}

export default function Pipeline() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user); load()
    })
  }, [])

  const load = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at',{ascending:false})
    setLeads(data||[]); setLoading(false)
  }

  const getByStage = (stage) => leads.filter(l => l.status === stage)
  const totalValue = (stage) => getByStage(stage).reduce((s,l)=>s+(l.wert||0),0)

  const onDragStart = (e, lead) => {
    setDragging(lead)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = async (e, stage) => {
    e.preventDefault()
    if (!dragging || dragging.status === stage) { setDragging(null); setDragOver(null); return }
    await supabase.from('leads').update({status:stage}).eq('id',dragging.id)
    setLeads(prev => prev.map(l => l.id === dragging.id ? {...l,status:stage} : l))
    setDragging(null); setDragOver(null)
  }

  const totalRevPipeline = leads.filter(l=>l.status==='Gewonnen').reduce((s,l)=>s+(l.wert||0),0)
  const totalOpen = leads.filter(l=>!['Gewonnen','Verloren'].includes(l.status)).reduce((s,l)=>s+(l.wert||0),0)

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Pipeline</span>
            <span style={{fontSize:13,color:'#9b9b9b'}}>{leads.length} Leads</span>
          </div>
          <div className="topbar-right" style={{gap:16}}>
            <div style={{fontSize:13,color:'#6b6b6b'}}>Offen: <strong style={{color:'#1a1a1a'}}>€{totalOpen.toLocaleString('de-DE')}</strong></div>
            <div style={{fontSize:13,color:'#6b6b6b'}}>Gewonnen: <strong style={{color:'#008060'}}>€{totalRevPipeline.toLocaleString('de-DE')}</strong></div>
          </div>
        </div>

        <div style={{padding:'20px 24px',flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
          {loading ? <div style={{textAlign:'center',padding:48,color:'#9b9b9b'}}>Laden...</div> : (
            <div style={{display:'flex',gap:12,flex:1,overflowX:'auto',paddingBottom:8}}>
              {STAGES.map(stage => (
                <div key={stage} style={{flex:'0 0 230px',display:'flex',flexDirection:'column'}}
                  onDragOver={e=>{e.preventDefault();setDragOver(stage)}}
                  onDrop={e=>onDrop(e,stage)}
                  onDragLeave={()=>setDragOver(null)}>
                  <div style={{padding:'10px 12px',background:STAGE_COLORS[stage],borderRadius:'8px 8px 0 0',marginBottom:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:12,fontWeight:600,color:'#1a1a1a'}}>{stage}</span>
                      <span style={{fontSize:11,background:'rgba(0,0,0,0.1)',borderRadius:10,padding:'1px 7px',fontWeight:600}}>{getByStage(stage).length}</span>
                    </div>
                    {totalValue(stage) > 0 && <div style={{fontSize:11,color:'rgba(0,0,0,0.55)',marginTop:2}}>€{totalValue(stage).toLocaleString('de-DE')}</div>}
                  </div>
                  <div style={{flex:1,background:dragOver===stage?'#f0f7ff':'#f8f8f8',border:`2px dashed ${dragOver===stage?'#2c6ecb':'transparent'}`,borderTop:'none',borderRadius:'0 0 8px 8px',padding:8,minHeight:200,transition:'all .15s'}}>
                    {getByStage(stage).map(lead => (
                      <div key={lead.id} draggable
                        onDragStart={e=>onDragStart(e,lead)}
                        onDragEnd={()=>{setDragging(null);setDragOver(null)}}
                        style={{background:'#fff',border:'1px solid #e3e3e3',borderRadius:6,padding:'10px 12px',marginBottom:6,cursor:'grab',boxShadow:'0 1px 2px rgba(0,0,0,0.04)',opacity:dragging?.id===lead.id?0.4:1,transition:'opacity .15s'}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
                          <div style={{width:24,height:24,borderRadius:'50%',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',flexShrink:0}}>{lead.name?.slice(0,2).toUpperCase()}</div>
                          <span style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lead.name}</span>
                        </div>
                        {lead.nische && <div style={{fontSize:11,color:'#9b9b9b',marginBottom:4}}>{lead.nische}</div>}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          {lead.wert ? <span style={{fontSize:12,fontWeight:600,color:'#008060'}}>€{lead.wert.toLocaleString('de-DE')}</span> : <span/>}
                          {lead.quelle && <span style={{fontSize:10,background:'#f0f0f0',borderRadius:4,padding:'1px 5px',color:'#6b6b6b'}}>{lead.quelle}</span>}
                        </div>
                        {lead.tags && <div style={{marginTop:5,fontSize:10,color:'#9b9b9b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lead.tags}</div>}
                      </div>
                    ))}
                    {getByStage(stage).length === 0 && (
                      <div style={{textAlign:'center',padding:'20px 8px',color:'#c0c0c0',fontSize:12}}>Keine Leads</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
