import { Controller, Get, Query } from '@nestjs/common';
import { GetFileContentUseCase } from '../../application/use-cases/get-file-content.use-case';
import { FileContentQueryDto } from './dto/file-content-query.dto';

@Controller('files')
export class FilesController {
  constructor(
    private readonly getFileContentUseCase: GetFileContentUseCase,
  ) {}

  @Get('content')
  async getContent(@Query() query: FileContentQueryDto) {
    return this.getFileContentUseCase.execute(query.path);
  }
}
