
'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'

const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'

export default function Dashboard(){
  const [catalog, setCatalog] = useState<string[]>([])
  const [metric, setMetric] = useState('fabric_index')
  const [fc, setFc] = useState<any>(null)
  const [hot, setHot] = useState<any>(null)
  const [hex, setHex] = useState<any>(null)
  const [res, setRes] = useState(8)

  useEffect(()=>{ fetch(etl+'/tools/catalog').then(r=>r.json()).then(j=>setCatalog(j.tools||[])) },[])
  useEffect(()=>{ fetch(etl+'/tools/choropleth?metric='+metric).then(r=>r.json()).then(setFc); if(hot){ fetch(etl+'/tools/gi_hotspots_geojson?metric='+metric).then(r=>r.json()).then(setHot) }; if(hex){ fetch(etl+`/tools/h3_aggregate?res=${res}&metric=${metric}`).then(r=>r.json()).then(setHex)} },[metric])
  useEffect(()=>{ if(hex){ fetch(etl+`/tools/h3_aggregate?res=${res}&metric=${metric}`).then(r=>r.json()).then(setHex) } },[res])

  return <div>
    <h2>Fabric Analytics Dashboard</h2>
    <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
      <label>Metric:</label>
      <select value={metric} onChange={e=>setMetric(e.target.value)}>
        <option value="fabric_index">fabric_index</option>
        {catalog.map(m=> <option key={m} value={m}>{m}</option>)}
      </select>

      <label><input type="checkbox" checked={!!hot} onChange={e=>{ if(e.target.checked){ fetch(etl+'/tools/gi_hotspots_geojson?metric='+metric).then(r=>r.json()).then(setHot)} else { setHot(null) } }} /> Hot/Cold (Gi*)</label>
      <label><input type="checkbox" checked={!!hex} onChange={e=>{ if(e.target.checked){ fetch(etl+`/tools/h3_aggregate?res=${res}&metric=${metric}`).then(r=>r.json()).then(setHex)} else { setHex(null) } }} /> H3 Grid</label>
      <label>H3 Res:</label>
      <input type="number" min={4} max={12} value={res} onChange={e=>setRes(parseInt(e.target.value||'8'))} />
    </div>

    <div style={{height:'75vh', marginTop:8}}>
      <MapContainer center={[24.7136,46.6753]} zoom={10} style={{height:'100%'}}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {fc && <GeoJSON data={fc} style={(f:any)=>({color:'#333',weight:1,fillOpacity:.45, fillColor:'#aaa'})} />}
        {hot && <GeoJSON data={hot} style={(f:any)=>{
          const cls = f?.properties?.class
          return {color: cls==='hot'?'#b30000':(cls==='cold'?'#0050b3':'#999'), weight:1, fillOpacity:.45,
                  fillColor: cls==='hot'?'#ff4d4f':(cls==='cold'?'#69c0ff':'#d9d9d9')}
        }} />}
        {hex && <GeoJSON data={hex} style={(f:any)=>({color:'#333',weight:1,fillOpacity:.35, fillColor:'#7cb305'})} />}
      </MapContainer>
    </div>
  </div>
}
