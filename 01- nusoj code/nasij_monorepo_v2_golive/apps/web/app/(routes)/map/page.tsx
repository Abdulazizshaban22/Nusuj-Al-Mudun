
'use client'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useState } from 'react'

export default function MapPage(){
  const [fc, setFc] = useState<any>(null)
  const [dev, setDev] = useState<number[]|null>(null)
  const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'

  useEffect(()=>{
    fetch(etl + '/geo/cells_with_indicators').then(r=>r.json()).then(setFc)
    fetch(etl + '/deviation/score_from_indicators').then(r=>r.json()).then(d=>setDev(d.scores))
  },[])

  function styleByDeviation(i:number){
    if(!dev) return {color:'#333',weight:1,fillOpacity:.2}
    const v = dev[i] ?? 0
    const r = Math.min(255, Math.floor(255*v))
    const g = Math.min(255, Math.floor(255*(1-v)))
    return { color:'#000', weight:1, fillColor:`rgb(${r},${g},64)`, fillOpacity:0.45 }
  }

  return <div style={{height:'80vh'}}>
    <MapContainer center={[24.7136,46.6753]} zoom={11} style={{height:'100%'}}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      {fc && <GeoJSON data={fc} style={(f:any)=>styleByDeviation((f?.properties?.id||1)-1)} />}
    </MapContainer>
  </div>
}
