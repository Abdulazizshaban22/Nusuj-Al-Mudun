
import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common'
import { pool } from './db'

@Controller('admin/users')
export class UsersController {
  @Get()
  async list(){
    const { rows } = await pool.query('SELECT id,email,name,role,created_at FROM admin_users ORDER BY id')
    return rows
  }
  @Post()
  async create(@Body() b: any){
    const { email, name, role } = b
    const q = 'INSERT INTO admin_users(email,name,role) VALUES ($1,$2,$3) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role RETURNING id,email,name,role'
    const { rows } = await pool.query(q, [email, name, role||'viewer'])
    return rows[0]
  }
  @Put(':id/role')
  async setRole(@Param('id') id:string, @Body() b:any){
    const { role } = b
    const { rows } = await pool.query('UPDATE admin_users SET role=$1 WHERE id=$2 RETURNING id,email,name,role',[role, id])
    return rows[0]
  }
}
