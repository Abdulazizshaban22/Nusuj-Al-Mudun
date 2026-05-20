
const sims = [
  'Traffic Shift','Transit Uplift','Heat Island','Green Corridors','Flood Risk',
  'POI Demand','LandUse Mix','Noise Spread','Solar Rooftops','Parking Stress'
]
export default function Sims(){
  return <div><h2>Simulations (10)</h2><ol>{sims.map(s=> <li key={s}><a href={'/simulations/'+encodeURIComponent(s)}>{s}</a></li>)}</ol></div>
}
