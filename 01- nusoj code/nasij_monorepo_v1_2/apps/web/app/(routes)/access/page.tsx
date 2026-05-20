'use client'
import { MapContainer, TileLayer, GeoJSON, Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
export default function Page(){
  const [center,setCenter]=useState<[number,number]>([24.7136,46.6753])
  const [poly,setPoly]=useState<any>(null)
  function Clicker(){ useMapEvents({click:e=>setCenter([e.latlng.lat,e.latlng.lng])}); return null }
  async function run(){
    const res = await fetch('http://localhost:9101/access/isochrone',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:[center[1],center[0]],cutoff:900,grid_km:5,n:200})})
    setPoly(await res.json())
  }
  useEffect(()=>{run()},[])
  return (<main style={{height:'100vh'}}>
    <MapContainer center={center} zoom={12} style={{height:'100%'}}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <Clicker />
      <Marker position={center as any} />
      {poly && <GeoJSON data={poly} style={{color:'#0a7',weight:2,fillOpacity:0.2}}/>}
    </MapContainer>
  </main>)
}
