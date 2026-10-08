export type TSource = {
  id: string;
  path: string;
  name: string;
  addedAt: string;
};

export type TFileNodeType = 'file' | 'folder';

export type TFileNode = {
  name: string;
  path: string;
  type: TFileNodeType;
  extension?: string;
  children?: TFileNode[];
};

export type TSourceTree = {
  sourceId: string;
  sourceName: string;
  tree: TFileNode[];
};

export type TFileContentType = 'markdown' | 'html';

export type TFileContent = {
  content: string;
  type: TFileContentType;
};
