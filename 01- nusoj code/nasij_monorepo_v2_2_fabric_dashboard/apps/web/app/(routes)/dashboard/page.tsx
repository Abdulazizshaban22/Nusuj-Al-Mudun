
'use client'
import { useEffect, useState } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, BarElement, BarController } from 'chart.js'
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, BarElement, BarController)

export default function Dashboard(){
  const [kpi,setKpi]=useState<any>({})
  const etl = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'
  useEffect(()=>{ fetch(etl+'/kpi/summary').then(r=>r.json()).then(setKpi) },[])
  return <div>
    <h2>Urban KPI Board</h2>
    <ul>
      <li>Fabric Index: <b>{kpi.fabric_index?.toFixed?.(1) ?? '-'}</b></li>
      <li>Sprawl Risk: <b>{kpi.sprawl_risk?.toFixed?.(1) ?? '-'}</b></li>
      <li>Harmony Score: <b>{kpi.harmony?.toFixed?.(1) ?? '-'}</b></li>
    </ul>
  </div>
}
