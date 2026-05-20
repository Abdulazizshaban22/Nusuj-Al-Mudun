
import { Module } from '@nestjs/common'
import { Controller, Get } from '@nestjs/common'

@Module({ controllers: [AdminController] })
export class AppModule{}

@Controller()
export class AdminController {
  @Get('/health') health(){ return { ok:true, ts: Date.now() } }
  @Get('/admin/version') version(){ return { version: '2.0.0' } }
}
