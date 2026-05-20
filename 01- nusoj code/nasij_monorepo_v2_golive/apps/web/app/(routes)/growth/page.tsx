
'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'

export default function GrowthPage(){
  const [fc,setFc] = useState<any>(null)
  const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'
  useEffect(()=>{ fetch(etl+'/growth/hotspots').then(r=>r.json()).then(setFc) },[])
  return <div>
    <h2>Urban Growth Hotspots</h2>
    <div style={{height:'70vh'}}>
      <MapContainer center={[24.7136,46.6753]} zoom={11} style={{height:'100%'}}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {fc && <GeoJSON data={fc} />}
      </MapContainer>
    </div>
  </div>
}
