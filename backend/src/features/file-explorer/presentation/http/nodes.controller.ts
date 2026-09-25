import { Body, Controller, Post } from '@nestjs/common';
import { SyncNodeUseCase } from '../../application/use-cases/sync-node.use-case';
import { SyncNodeDto } from './dto/sync-node.dto';
import { FileNodeResponseDto } from './dto/file-node-response.dto';

@Controller('nodes')
export class NodesController {
  constructor(private readonly syncNodeUseCase: SyncNodeUseCase) {}

  @Post('sync')
  async sync(@Body() dto: SyncNodeDto): Promise<FileNodeResponseDto[]> {
    const nodes = await this.syncNodeUseCase.execute(dto.path);
    return nodes.map(FileNodeResponseDto.fromDomain);
  }
}
