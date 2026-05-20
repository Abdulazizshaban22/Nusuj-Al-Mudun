
'use client'
import { MapContainer, TileLayer, GeoJSON, Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
export default function AccessPage(){
  const [center,setCenter]=useState<[number,number]>([24.7136,46.6753])
  const [poly,setPoly]=useState<any>(null)
  const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'
  function Clicker(){ useMapEvents({click:e=>setCenter([e.latlng.lat,e.latlng.lng])}); return null }
  async function run(){ const res = await fetch(etl+'/access/isochrone', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:[center[1],center[0]],cutoff:900,grid_km:5,n:200})}); setPoly(await res.json())}
  useEffect(()=>{run()},[])
  useEffect(()=>{run()},[center.toString()])
  return <div style={{height:'80vh'}}>
    <MapContainer center={center} zoom={12} style={{height:'100%'}}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <Clicker />
      <Marker position={center as any} />
      {poly && <GeoJSON data={poly} />}
    </MapContainer>
  </div>
}
