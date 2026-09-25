import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { AddSourceUseCase } from '../../application/use-cases/add-source.use-case';
import { ListSourcesUseCase } from '../../application/use-cases/list-sources.use-case';
import { GetSourceTreeUseCase } from '../../application/use-cases/get-source-tree.use-case';
import { AddSourceDto } from './dto/add-source.dto';
import { SourceResponseDto } from './dto/source-response.dto';
import {
  FileNodeResponseDto,
  SourceTreeResponseDto,
} from './dto/file-node-response.dto';

@Controller('sources')
export class SourcesController {
  constructor(
    private readonly addSourceUseCase: AddSourceUseCase,
    private readonly listSourcesUseCase: ListSourcesUseCase,
    private readonly getSourceTreeUseCase: GetSourceTreeUseCase,
  ) {}

  @Get()
  async list(): Promise<SourceResponseDto[]> {
    const sources = await this.listSourcesUseCase.execute();
    return sources.map(SourceResponseDto.fromDomain);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: AddSourceDto): Promise<SourceResponseDto> {
    const source = await this.addSourceUseCase.execute({
      path: dto.path,
      name: dto.name,
    });
    return SourceResponseDto.fromDomain(source);
  }

  @Get(':id/tree')
  async getTree(@Param('id') id: string): Promise<SourceTreeResponseDto> {
    const { source, tree } = await this.getSourceTreeUseCase.execute(id);
    const dto = new SourceTreeResponseDto();
    dto.sourceId = source.id;
    dto.sourceName = source.name;
    dto.tree = tree.map(FileNodeResponseDto.fromDomain);
    return dto;
  }
}
