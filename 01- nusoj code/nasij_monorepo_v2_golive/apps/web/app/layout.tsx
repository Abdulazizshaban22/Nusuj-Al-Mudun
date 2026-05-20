
export const metadata = { title: 'NASIJ v2' }
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><main className="wrap">{children}</main></body></html>
}
