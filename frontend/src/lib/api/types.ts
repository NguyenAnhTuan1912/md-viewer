export interface ISource {
  id: string;
  path: string;
  name: string;
  addedAt: string;
}

export type TFileNodeType = 'file' | 'folder';

export interface IFileNode {
  name: string;
  path: string;
  type: TFileNodeType;
  extension?: string;
  children?: IFileNode[];
}

export interface ISourceTree {
  sourceId: string;
  sourceName: string;
  tree: IFileNode[];
}

export type TFileContentType = 'markdown' | 'html';

export interface IFileContent {
  content: string;
  type: TFileContentType;
}
