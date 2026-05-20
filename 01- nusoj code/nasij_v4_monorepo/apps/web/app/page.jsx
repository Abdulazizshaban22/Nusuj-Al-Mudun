import React from 'react';

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { ok:false };
  }
}

export default async function Home() {
  const api = await fetchJSON(process.env.API_BASE_URL + "/health");
  const etl = await fetchJSON(process.env.ETL_BASE_URL + "/health");
  return (
    <main style={{padding:24, fontFamily:"ui-sans-serif"}}>
      <h1>NASIJ v4 — لوحة البدء</h1>
      <p>هذه نسخة تطوير محلية للتأكد من الربط بين الخدمات.</p>

      <section style={{marginTop:16}}>
        <h3>حالة الخدمات</h3>
        <ul>
          <li>API: {api?.status || "off"}</li>
          <li>ETL: {etl?.status || "off"}</li>
        </ul>
      </section>

      <section style={{marginTop:16}}>
        <h3>مؤشر تجريبي (Fabric)</h3>
        <pre>{JSON.stringify(await fetchJSON(process.env.ETL_BASE_URL + "/fabric/demo"), null, 2)}</pre>
      </section>
    </main>
  );
}