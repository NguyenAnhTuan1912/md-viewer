import * as fs from 'fs/promises';
import * as path from 'path';
import { FileNode } from '../../domain/entities/file-node.entity';
import { FileSystemPort } from '../../application/ports/file-system.port';

const SUPPORTED_EXTENSIONS = new Set(['.md', '.html']);

export class NodeFileSystemService implements FileSystemPort {
  async isDirectory(filePath: string): Promise<boolean> {
    return (await fs.stat(filePath)).isDirectory();
  }

  async scanDirectory(rootPath: string): Promise<FileNode[]> {
    return this.scanRecursive(rootPath);
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async readFileBuffer(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  private async scanRecursive(dirPath: string): Promise<FileNode[]> {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return [];
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    const nodes: FileNode[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const children = await this.scanRecursive(entryPath);
        if (children.length > 0) {
          nodes.push(FileNode.folder(entry.name, entryPath, children));
        }
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(extension)) {
          nodes.push(FileNode.file(entry.name, entryPath, extension));
        }
      }
    }

    return this.sortNodes(nodes);
  }

  private sortNodes(nodes: FileNode[]): FileNode[] {
    const folders = nodes.filter((n) => n.type === 'folder');
    const files = nodes.filter((n) => n.type === 'file');
    return [...folders, ...files];
  }
}
