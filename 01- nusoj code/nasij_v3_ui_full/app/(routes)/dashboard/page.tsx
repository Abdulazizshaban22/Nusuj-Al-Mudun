
'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ETL } from '@/lib_fetch'
const MapContainer = dynamic(()=>import('react-leaflet').then(m=>m.MapContainer),{ssr:false})
const TileLayer = dynamic(()=>import('react-leaflet').then(m=>m.TileLayer),{ssr:false})
const GeoJSON = dynamic(()=>import('react-leaflet').then(m=>m.GeoJSON),{ssr:false})

function Legend(){ return <div className="card fixed bottom-4 left-4 text-xs">Fabric • Deviation • Connectivity • ...</div> }

export default function Dashboard(){
  const [metric,setMetric]=useState('fabric_index')
  const [catalog,setCatalog]=useState<string[]>([])
  const [fc,setFc]=useState<any>(null)
  const [hot,setHot]=useState<any>(null)
  const [hex,setHex]=useState<any>(null)
  const [res,setRes]=useState(8)
  useEffect(()=>{ fetch(ETL+'/tools/catalog').then(r=>r.json()).then(d=>setCatalog(d.tools||[])) },[])
  useEffect(()=>{ fetch(ETL+'/tools/choropleth?metric='+metric).then(r=>r.json()).then(setFc); if(hot){fetch(ETL+'/tools/gi_hotspots_geojson?metric='+metric).then(r=>r.json()).then(setHot)}; if(hex){fetch(ETL+`/tools/h3_aggregate?res=${res}&metric=${metric}`).then(r=>r.json()).then(setHex)} },[metric])
  useEffect(()=>{ if(hex){ fetch(ETL+`/tools/h3_aggregate?res=${res}&metric=${metric}`).then(r=>r.json()).then(setHex)} },[res])
  return <div className="space-y-3">
    <div className="card flex flex-wrap gap-3 items-center">
      <label>المؤشر:</label>
      <select className="select" value={metric} onChange={e=>setMetric(e.target.value)}>
        <option value="fabric_index">fabric_index</option>
        {catalog.map(m=><option key={m} value={m}>{m}</option>)}
      </select>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={!!hot} onChange={e=>{ if(e.target.checked){fetch(ETL+'/tools/gi_hotspots_geojson?metric='+metric).then(r=>r.json()).then(setHot)} else { setHot(null) } }} />
        Hot/Cold (Gi*)
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={!!hex} onChange={e=>{ if(e.target.checked){fetch(ETL+`/tools/h3_aggregate?res=${res}&metric=${metric}`).then(r=>r.json()).then(setHex)} else { setHex(null) } }} />
        H3 Grid
      </label>
      <label>H3 Res:</label>
      <input className="select" type="number" min={4} max={12} value={res} onChange={e=>setRes(parseInt(e.target.value||'8'))} />
    </div>
    <div className="h-[72vh] rounded-xl overflow-hidden">
      <MapContainer center={[24.7136,46.6753]} zoom={10} style={{height:'100%'}}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {fc && <GeoJSON data={fc} style={(f:any)=>({color:'#333',weight:1,fillOpacity:.45, fillColor:'#6ee7b7'})} />}
        {hot && <GeoJSON data={hot} style={(f:any)=>{
          const cls=f?.properties?.class
          return {color: cls==='hot'?'#b30000':(cls==='cold'?'#0050b3':'#999'), weight:1, fillOpacity:.45,
                  fillColor: cls==='hot'?'#ff4d4f':(cls==='cold'?'#69c0ff':'#d9d9d9')}
        }} />}
        {hex && <GeoJSON data={hex} style={(f:any)=>({color:'#333',weight:1,fillOpacity:.35, fillColor:'#7cb305'})} />}
      </MapContainer>
      <Legend/>
    </div>
    <InsightPanel metric={metric}/>
  </div>
}

function InsightPanel({metric}:{metric:string}){
  const [report,setReport]=useState<any>(null)
  useEffect(()=>{ fetch((process.env.NEXT_PUBLIC_ETL_BASE||'http://localhost:9101')+'/insight/report?metric='+metric+'&city=riyadh').then(r=>r.ok?r.json():{text_ar:'—'} as any).then(setReport).catch(()=>{}) },[metric])
  return <div className="card">
    <b>التفسير الذكي</b>
    <p className="text-neutral-300 mt-1 whitespace-pre-wrap">{report?.text_ar || '—'}</p>
  </div>
}
