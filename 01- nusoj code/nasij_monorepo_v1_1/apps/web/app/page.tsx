export default function Page() {
  return (
    <main style={{padding:24}}>
      <h1>NASIJ — Smart Urban Fabric Engine</h1>
      <p>v1.1 Algorithms live: AHP, TOPSIS, DBSCAN, IsolationForest, NDVI, LST.</p>
      <ul>
        <li><a href="/weights">Weights (AHP)</a></li>
        <li><a href="/rank">Ranking (TOPSIS)</a></li>
        <li><a href="/map">Fabric Map</a></li>
        <li><a href="/access">Accessibility</a></li>
        <li><a href="/compare">Compare</a></li>
        <li><a href="/status">System Status</a></li>
      </ul>
    </main>
  );
}