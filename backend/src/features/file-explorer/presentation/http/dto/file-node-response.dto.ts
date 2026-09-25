import { FileNode } from '../../../domain/entities/file-node.entity';

export class FileNodeResponseDto {
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: FileNodeResponseDto[];

  static fromDomain(node: FileNode): FileNodeResponseDto {
    const dto = new FileNodeResponseDto();
    dto.name = node.name;
    dto.path = node.path;
    dto.type = node.type;
    dto.extension = node.extension;
    dto.children = node.children?.map(FileNodeResponseDto.fromDomain);
    return dto;
  }
}

export class SourceTreeResponseDto {
  sourceId: string;
  sourceName: string;
  tree: FileNodeResponseDto[];
}
