import { Controller, Get } from '@nestjs/common';

@Controller('/api/fabric')
export class FabricController {
  @Get('/efficiency')
  efficiency() {
    return { index: 0.78, updated_at: new Date().toISOString() };
  }

  @Get('/connectivity-heatmap')
  heatmap() {
    return { cells: [], meta: { note: 'stub' } };
  }
}
