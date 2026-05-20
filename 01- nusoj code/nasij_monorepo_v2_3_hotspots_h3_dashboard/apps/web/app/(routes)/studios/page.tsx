
'use client'
import { useState, useEffect } from 'react'

const studios = ['Mobility','Green','Heritage','Safety','Energy','Water','Housing','Economy','Wellbeing','Governance']
const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'

export default function Studios(){
  const [studio,setStudio] = useState(studios[0])
  const [scores,setScores] = useState<any>(null)
  async function load(){ const r = await fetch(etl+'/studio/scores?studio='+encodeURIComponent(studio)); setScores(await r.json()) }
  useEffect(()=>{load()},[studio])
  return <div>
    <h2>Studios</h2>
    <select value={studio} onChange={e=>setStudio(e.target.value)}>{studios.map(s=><option key={s}>{s}</option>)}</select>
    <pre>{scores?JSON.stringify(scores,null,2):'...'}</pre>
  </div>
}
