import { IsString, MinLength } from 'class-validator';

export class FileContentQueryDto {
  @IsString()
  @MinLength(1)
  path: string;
}
