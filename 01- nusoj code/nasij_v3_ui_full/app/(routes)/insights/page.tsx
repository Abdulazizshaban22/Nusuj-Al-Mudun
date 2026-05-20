
'use client'
import { useEffect, useState } from 'react'
import { ETL } from '@/lib_fetch'

export default function Insights(){
  const [city,setCity]=useState('riyadh')
  const [metric,setMetric]=useState('fabric_index')
  const [text,setText]=useState<string>('')
  const [lang,setLang]=useState<'ar'|'en'>('ar')

  async function load(){
    const res = await fetch(`${ETL}/insight/report?metric=${metric}&city=${city}`)
    const j = await res.json()
    setText(lang==='ar' ? (j.text_ar||'—') : (j.text_en||'—'))
  }
  useEffect(()=>{ load() },[city,metric,lang])

  return <div className="space-y-3">
    <div className="card flex flex-wrap items-center gap-3">
      <label>المدينة:</label>
      <select className="select" value={city} onChange={e=>setCity(e.target.value)}>
        <option value="riyadh">Riyadh</option>
        <option value="jeddah">Jeddah</option>
        <option value="dammam">Dammam</option>
      </select>
      <label>المؤشر:</label>
      <select className="select" value={metric} onChange={e=>setMetric(e.target.value)}>
        <option value="fabric_index">fabric_index</option>
        <option value="deviation">deviation</option>
        <option value="connectivity">connectivity</option>
        <option value="resilience">resilience</option>
      </select>
      <label>اللغة:</label>
      <select className="select" value={lang} onChange={e=>setLang(e.target.value as any)}>
        <option value="ar">العربية</option>
        <option value="en">English</option>
      </select>
      <button className="btn" onClick={load}>تحديث</button>
    </div>
    <div className="card whitespace-pre-wrap leading-7">{text || '—'}</div>
  </div>
}
