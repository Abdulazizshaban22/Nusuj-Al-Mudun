
'use client'
import { useEffect, useState } from 'react'
const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'
const sims = ['Traffic Shift','Transit Uplift','Heat Island','Green Corridors','Flood Risk','POI Demand','LandUse Mix','Noise Spread','Solar Rooftops','Parking Stress']

export default function Simulations(){
  const [name,setName]=useState(sims[0])
  const [res,setRes]=useState<any>(null)
  async function run(){ const r = await fetch(etl+'/sim/run?name='+encodeURIComponent(name)); setRes(await r.json()) }
  useEffect(()=>{run()},[name])
  return <div>
    <h2>Simulations</h2>
    <select value={name} onChange={e=>setName(e.target.value)}>{sims.map(s=><option key={s}>{s}</option>)}</select>
    <button onClick={run} style={{marginLeft:8}}>Run</button>
    <pre>{res?JSON.stringify(res,null,2):'...'}</pre>
  </div>
}
