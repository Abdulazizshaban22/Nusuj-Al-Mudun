
const studios = [
  'Mobility Studio','Green Studio','Heritage Studio','Safety Studio','Energy Studio',
  'Water Studio','Housing Studio','Economy Studio','Wellbeing Studio','Governance Studio'
]
export default function Studios(){
  return <div><h2>Studios (10)</h2><ol>{studios.map(s=> <li key={s}><a href={'/studios/'+encodeURIComponent(s)}>{s}</a></li>)}</ol></div>
}
