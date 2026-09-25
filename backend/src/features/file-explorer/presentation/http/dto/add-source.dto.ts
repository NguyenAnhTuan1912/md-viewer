import { IsOptional, IsString, MinLength } from 'class-validator';

export class AddSourceDto {
  @IsString()
  @MinLength(1)
  path: string;

  @IsOptional()
  @IsString()
  name?: string;
}
