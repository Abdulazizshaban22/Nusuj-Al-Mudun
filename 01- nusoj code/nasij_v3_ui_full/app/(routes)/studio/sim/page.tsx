
'use client'
import { useEffect, useState } from 'react'
const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'

const sims = ['Traffic Shift','Transit Uplift','Heat Island','Green Corridors','Flood Risk','POI Demand','LandUse Mix','Noise Spread','Solar Rooftops','Parking Stress']

export default function Sim(){
  const [name,setName]=useState(sims[0])
  const [delta,setDelta]=useState(0.1)
  const [res,setRes]=useState<any>(null)
  async function run(){ const r = await fetch(etl+`/sim/run?name=${encodeURIComponent(name)}&delta=${delta}`); setRes(await r.json()) }
  useEffect(()=>{ run() },[name,delta])
  return <div className="space-y-3">
    <div className="card flex flex-wrap items-center gap-3">
      <b>محاكاة حضرية</b>
      <select className="select" value={name} onChange={e=>setName(e.target.value)}>{sims.map(s=><option key={s} value={s}>{s}</option>)}</select>
      <label>delta</label><input className="select" type="number" step="0.1" value={delta} onChange={e=>setDelta(parseFloat(e.target.value||'0.1'))}/>
      <button className="btn" onClick={run}>تشغيل</button>
    </div>
    <div className="card text-xs overflow-auto max-h-[70vh]"><pre>{res?JSON.stringify(res,null,2):'—'}</pre></div>
  </div>
}
