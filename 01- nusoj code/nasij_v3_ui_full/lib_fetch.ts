
export const ETL = process.env.NEXT_PUBLIC_ETL_BASE || 'http://localhost:9101'
export const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8088'
export const j = (r:Response)=>r.json()
