import { FileNode } from '../entities/file-node.entity';

export const FILE_SYSTEM_PORT = Symbol('FILE_SYSTEM_PORT');

/**
 * Port for interacting with the physical filesystem: scanning directory
 * trees and reading file contents. Implementations should only expose
 * .md/.html files and folders that (transitively) contain them.
 */
export interface FileSystemPort {
  scanDirectory(rootPath: string): Promise<FileNode[]>;
  readFile(filePath: string): Promise<string>;
  readFileBuffer(filePath: string): Promise<Buffer>;
}
