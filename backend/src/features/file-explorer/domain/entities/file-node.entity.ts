export type FileNodeType = 'file' | 'folder';

export interface FileNodeProps {
  name: string;
  path: string;
  type: FileNodeType;
  extension?: string;
  children?: FileNode[];
}

export class FileNode {
  readonly name: string;
  readonly path: string;
  readonly type: FileNodeType;
  readonly extension?: string;
  readonly children?: FileNode[];

  constructor(props: FileNodeProps) {
    this.name = props.name;
    this.path = props.path;
    this.type = props.type;
    this.extension = props.extension;
    this.children = props.children;
  }

  static file(name: string, filePath: string, extension: string): FileNode {
    return new FileNode({ name, path: filePath, type: 'file', extension });
  }

  static folder(
    name: string,
    folderPath: string,
    children: FileNode[],
  ): FileNode {
    return new FileNode({ name, path: folderPath, type: 'folder', children });
  }
}
