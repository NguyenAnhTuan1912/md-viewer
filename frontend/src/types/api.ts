export interface Source {
  id: string;
  path: string;
  name: string;
  addedAt: string;
}

export type FileNodeType = 'file' | 'folder';

export interface FileNode {
  name: string;
  path: string;
  type: FileNodeType;
  extension?: string;
  children?: FileNode[];
}

export interface SourceTree {
  sourceId: string;
  sourceName: string;
  tree: FileNode[];
}

export type FileContentType = 'markdown' | 'html';

export interface FileContent {
  content: string;
  type: FileContentType;
}
