'use client'
import { useState } from 'react';

export default function Page() {
  const [matrix, setMatrix] = useState('[[1,3,1/5],[1/3,1,1/7],[5,7,1]]');
  const [result, setResult] = useState<any>(null);

  async function runAHP() {
    const res = await fetch('http://localhost:9101/algo/ahp', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ pairwise: JSON.parse(matrix) })
    });
    setResult(await res.json());
  }

  return (
    <main style={{padding:24}}>
      <h2>Weights (AHP)</h2>
      <textarea rows={6} style={{width:'100%'}} value={matrix} onChange={e=>setMatrix(e.target.value)} />
      <button onClick={runAHP}>Compute AHP</button>
      <pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
    </main>
  );
}