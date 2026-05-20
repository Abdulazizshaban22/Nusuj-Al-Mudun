'use client'
import { useState } from 'react';

export default function Page() {
  const [data, setData] = useState('[[0.8, 20, 300],[0.6, 30, 250],[0.9, 25, 270]]');
  const [weights, setWeights] = useState('[0.5, 0.3, 0.2]');
  const [benefit, setBenefit] = useState('[true, true, false]');
  const [result, setResult] = useState<any>(null);

  async function runTOPSIS() {
    const res = await fetch('http://localhost:9101/algo/topsis', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ matrix: JSON.parse(data), weights: JSON.parse(weights), benefit: JSON.parse(benefit) })
    });
    setResult(await res.json());
  }

  return (
    <main style={{padding:24}}>
      <h2>Ranking (TOPSIS)</h2>
      <p>Matrix, weights, and benefit flags.</p>
      <textarea rows={5} style={{width:'100%'}} value={data} onChange={e=>setData(e.target.value)} />
      <input style={{width:'100%'}} value={weights} onChange={e=>setWeights(e.target.value)} />
      <input style={{width:'100%'}} value={benefit} onChange={e=>setBenefit(e.target.value)} />
      <button onClick={runTOPSIS}>Compute TOPSIS</button>
      <pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
    </main>
  );
}