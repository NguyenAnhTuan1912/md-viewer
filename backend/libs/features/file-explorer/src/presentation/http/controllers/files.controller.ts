import { UseFilters } from '@nestjs/common';
import { FileExplorerExceptionFilter } from '../filters/file-explorer-exception.filter';
import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GetFileContentUseCase } from '../../../application/use-cases/get-file-content.use-case';
import { GetFileAssetUseCase } from '../../../application/use-cases/get-file-asset.use-case';
import { FileContentQueryDto } from '../dto/file-content-query.dto';

@UseFilters(FileExplorerExceptionFilter)
@Controller('files')
export class FilesController {
  constructor(
    private readonly getFileContentUseCase: GetFileContentUseCase,
    private readonly getFileAssetUseCase: GetFileAssetUseCase,
  ) {}

  @Get('content')
  async getContent(@Query() query: FileContentQueryDto) {
    return this.getFileContentUseCase.execute(query.path);
  }

  @Get('asset')
  async getAsset(
    @Query() query: FileContentQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, contentType } = await this.getFileAssetUseCase.execute(
      query.path,
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(buffer);
  }
}
