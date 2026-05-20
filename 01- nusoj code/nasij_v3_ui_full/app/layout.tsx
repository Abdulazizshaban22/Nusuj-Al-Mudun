
import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'NASIJ v3', description: 'Urban Fabric Intelligence' }

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
          <div className="max-w-7xl mx-auto flex items-center gap-4 p-3 text-sm">
            <b className="text-brand">NASIJ v3</b>
            <nav className="flex gap-3">
              <Link href="/">الرئيسية</Link>
              <Link href="/dashboard">لوحة النسيج</Link>
              <Link href="/insights">التقارير الذكية</Link>
              <Link href="/iot/live">IoT مباشر</Link>
              <Link href="/studio/sim">الاستوديو</Link>
              <Link href="/admin">الإدارة</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
