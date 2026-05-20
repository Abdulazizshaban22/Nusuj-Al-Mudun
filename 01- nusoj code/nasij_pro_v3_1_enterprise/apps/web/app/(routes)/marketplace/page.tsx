
'use client'
import { useEffect, useState } from 'react'
const MKT = process.env.NEXT_PUBLIC_MKT_BASE || 'http://localhost:9110'

export default function Marketplace(){
  const [items, setItems] = useState<any[]>([])
  const [file, setFile] = useState<File|null>(null)
  async function load(){ const r = await fetch(MKT+'/plugins'); const j = await r.json(); setItems(j.items||[]) }
  async function install(){
    if(!file) return
    const fd = new FormData(); fd.append('file', file)
    await fetch(MKT+'/plugins/install',{method:'POST', body:fd})
    await load()
  }
  useEffect(()=>{ load() },[])
  return <div className="space-y-3">
    <h2 className="text-xl font-bold">Marketplace</h2>
    <div className="card flex items-center gap-3">
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <button className="btn" onClick={install}>Install</button>
    </div>
    <div className="card">
      <b>Installed plugins</b>
      <ul className="mt-2 list-disc ps-5">{items.map((p:any)=>(<li key={p.id}>{p.name} — {p.id}</li>))}</ul>
    </div>
  </div>
}
