'use client'
import Sidebar from '@/components/Sidebar'
export default function Page() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <div className="mc">
        <div className="tb"><div className="tb-title">Coming Soon</div></div>
        <div className="ct"><div style={{background:'#fff',borderRadius:16,padding:48,textAlign:'center',color:'var(--text-m)',border:'1px solid var(--border)'}}>Wird bald verfuegbar sein 🚀</div></div>
      </div>
    </div>
  )
}
