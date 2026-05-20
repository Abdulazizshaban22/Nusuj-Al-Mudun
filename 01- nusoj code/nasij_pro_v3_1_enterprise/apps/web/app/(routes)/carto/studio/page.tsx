
'use client'
import { useState } from 'react'

const CARTO = process.env.NEXT_PUBLIC_CARTO_BASE || 'http://localhost:9105'

export default function CartoStudio(){
  const [file, setFile] = useState<File|null>(null)
  const [name, setName] = useState('style')
  const [result, setResult] = useState<any>(null)
  async function upload(){
    if(!file) return
    const fd = new FormData()
    fd.append('name', name)
    fd.append('file', file)
    const r = await fetch(CARTO+'/carto/style',{method:'POST', body:fd})
    setResult(await r.json())
  }
  return <div className="space-y-3">
    <h2 className="text-xl font-bold">NASIJ Carto Studio</h2>
    <div className="card flex items-center gap-3">
      <input className="select" value={name} onChange={e=>setName(e.target.value)} placeholder="style name"/>
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <button className="btn" onClick={upload}>رفع SLD</button>
      <a className="btn" href={CARTO+'/carto/layouts'} target="_blank">القوالب</a>
    </div>
    <pre className="card text-xs">{JSON.stringify(result,null,2)||'—'}</pre>
  </div>
}
