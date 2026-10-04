import { FileNode } from '../../domain/entities/file-node.entity';

/**
 * Port for interacting with the physical filesystem: scanning directory
 * trees and reading file contents. Implementations should only expose
 * .md/.html files and folders that (transitively) contain them.
 */
export interface FileSystemPort {
  isDirectory(filePath: string): Promise<boolean>;
  scanDirectory(rootPath: string): Promise<FileNode[]>;
  readFile(filePath: string): Promise<string>;
  readFileBuffer(filePath: string): Promise<Buffer>;
}
