
'use client'
import useSWR from 'swr'
import { signIn, signOut, useSession } from 'next-auth/react'

const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8088'
const fetcher = (url:string)=>fetch(url).then(r=>r.json())

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

  return <div>
    <h2>Admin</h2>
    <div style={{marginBottom:12}}>
      {status==='authenticated' ? (<>
        <span>Signed in as {(session?.user as any)?.email}</span>
        <button onClick={()=>signOut()} style={{marginLeft:8}}>Sign out</button>
      </>) : (<button onClick={()=>signIn('keycloak')}>Sign in with Keycloak</button>)}
    </div>
    <button onClick={addUser}>Add/Upsert User</button>
    <table border={1} cellPadding={6} style={{marginTop:12}}>
      <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
      <tbody>{(data||[]).map((u:any)=>(<tr key={u.id}><td>{u.id}</td><td>{u.email}</td><td>{u.name}</td><td>{u.role}</td>
        <td><button onClick={()=>setRole(u.id)}>Change Role</button></td></tr>))}</tbody>
    </table>
  </div>
}
