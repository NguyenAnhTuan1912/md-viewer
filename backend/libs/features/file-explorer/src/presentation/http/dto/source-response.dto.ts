import { Source } from '../../../domain/entities/source.entity';

export class SourceResponseDto {
  id: string;
  path: string;
  name: string;
  addedAt: string;

  static fromDomain(source: Source): SourceResponseDto {
    const dto = new SourceResponseDto();
    dto.id = source.id;
    dto.path = source.path;
    dto.name = source.name;
    dto.addedAt = source.addedAt;
    return dto;
  }
}
