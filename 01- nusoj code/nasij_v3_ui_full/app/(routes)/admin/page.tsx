
'use client'
import useSWR from 'swr'
import { signIn, signOut, useSession } from 'next-auth/react'
const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8088'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())

export default function Admin(){
  const { data: session, status } = useSession()
  const { data, mutate } = useSWR(api + '/admin/users', fetcher)
  async function addUser(){
    const email = prompt('email?') || ''; const name=prompt('name?') || ''; const role=prompt('role? (admin/viewer)','viewer')||'viewer'
    await fetch(api+'/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,name,role})})
    mutate()
  }
  async function setRole(id:number){
    const role=prompt('new role? (admin/viewer)','viewer')||'viewer'
    await fetch(api+'/admin/users/'+id+'/role',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({role})})
    mutate()
  }
  return <div className="space-y-3">
    <div className="card flex items-center gap-3">
      {status==='authenticated' ? (<>
        <span>دخول: {(session?.user as any)?.email}</span>
        <button className="btn" onClick={()=>signOut()}>خروج</button>
      </>) : (<button className="btn" onClick={()=>signIn('keycloak')}>تسجيل الدخول</button>)}
    </div>
    <div className="card">
      <div className="flex justify-between items-center"><b>المستخدمون</b><button className="btn" onClick={addUser}>إضافة</button></div>
      <table className="w-full mt-3 text-sm">
        <thead><tr className="text-left text-neutral-400"><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {(data||[]).map((u:any)=>(
            <tr key={u.id} className="border-t border-neutral-800">
              <td>{u.id}</td><td>{u.email}</td><td>{u.name}</td><td>{u.role}</td>
              <td><button className="btn" onClick={()=>setRole(u.id)}>Role</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}
