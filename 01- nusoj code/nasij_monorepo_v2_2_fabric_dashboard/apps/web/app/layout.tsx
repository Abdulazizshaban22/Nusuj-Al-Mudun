
import Link from "next/link"
export const metadata = { title: 'NASIJ v2.1' }
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header style={{display:'flex',gap:12,alignItems:'center',padding:12,borderBottom:'1px solid #ddd'}}>
      <b>NASIJ v2.1</b>
      <Link href="/">Home</Link>
      <Link href="/map">Map</Link>
      <Link href="/access">Access</Link>
      <Link href="/growth">Growth</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/studios">Studios</Link>
      <Link href="/simulations">Simulations</Link>
      <Link href="/admin">Admin</Link>
    </header>
    <main className="wrap">{children}</main>
  </body></html>
}
