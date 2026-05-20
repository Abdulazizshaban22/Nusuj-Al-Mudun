
'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ETL } from '@/lib_fetch'
const MapContainer = dynamic(()=>import('react-leaflet').then(m=>m.MapContainer),{ssr:false})
const TileLayer = dynamic(()=>import('react-leaflet').then(m=>m.TileLayer),{ssr:false})
const GeoJSON = dynamic(()=>import('react-leaflet').then(m=>m.GeoJSON),{ssr:false})

export default function Live(){
  const [hex,setHex]=useState<any>(null)
  const [res,setRes]=useState(8)
  async function load(){ const r=await fetch(`${ETL}/tools/h3_aggregate?res=${res}&metric=fabric_index`); setHex(await r.json()) }
  useEffect(()=>{ load(); const t=setInterval(load,8000); return ()=>clearInterval(t)},[res])
  return <div className="space-y-3">
    <div className="card flex gap-3 items-center">
      <b>IoT Live</b>
      <span className="text-neutral-400">تحديث كل 8 ثوانٍ</span>
      <label>H3 Res:</label>
      <input className="select" type="number" min={4} max={12} value={res} onChange={e=>setRes(parseInt(e.target.value||'8'))} />
    </div>
    <div className="h-[72vh] rounded-xl overflow-hidden">
      <MapContainer center={[24.7136,46.6753]} zoom={10} style={{height:'100%'}}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {hex && <GeoJSON data={hex} style={(f:any)=>({color:'#333',weight:1,fillOpacity:.35, fillColor:'#38bdf8'})} />}
      </MapContainer>
    </div>
  </div>
}
