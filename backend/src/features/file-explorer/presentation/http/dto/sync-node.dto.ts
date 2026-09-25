import { IsString, MinLength } from 'class-validator';

export class SyncNodeDto {
  @IsString()
  @MinLength(1)
  path: string;
}
