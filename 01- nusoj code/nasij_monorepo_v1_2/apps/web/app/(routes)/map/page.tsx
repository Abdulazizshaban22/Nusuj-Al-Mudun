'use client'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useState } from 'react'

export default function Page(){
  const [fc, setFc] = useState<any>(null)
  useEffect(()=>{ fetch('http://localhost:9101/geo/cells_with_indicators').then(r=>r.json()).then(setFc) },[])
  return (<main style={{height:'100vh'}}>
    <MapContainer center={[24.7136,46.6753]} zoom={11} style={{height:'100%'}}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      {fc && <GeoJSON data={fc} />}
    </MapContainer>
  </main>)
}
