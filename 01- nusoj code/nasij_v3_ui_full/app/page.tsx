
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home(){
  return (
    <div className="space-y-8">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="text-center">
        <h1 className="text-4xl font-bold">المدينة كنسيج حيّ</h1>
        <p className="text-neutral-300 mt-2">نقرأ المدينة ونفهمها بالذكاء الاصطناعي — Fabric Analytics</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link className="btn" href="/dashboard">افتح لوحة النسيج</Link>
          <Link className="btn" href="/insights">التقارير الذكية</Link>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><b>100 أداة تحليل</b><p className="text-neutral-300 mt-2">مكاني + مناخي + اجتماعي</p></div>
        <div className="card"><b>Hot/Cold Gi*</b><p className="text-neutral-300 mt-2">كشف الأنماط الحارة والباردة</p></div>
        <div className="card"><b>H3 Grid</b><p className="text-neutral-300 mt-2">تجميع سداسي فوري</p></div>
      </div>
    </div>
  )
}
