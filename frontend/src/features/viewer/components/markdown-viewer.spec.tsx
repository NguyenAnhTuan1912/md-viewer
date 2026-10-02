import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownViewer } from '@/features/viewer/components/markdown-viewer';

const TEST_FILE_PATH = '/tmp/demo-docs/readme.md';

describe('MarkdownViewer', () => {
  it('renders headings', () => {
    render(<MarkdownViewer content={'# Title\n\n## Subtitle'} filePath={TEST_FILE_PATH} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument();
  });

  it('renders an unordered list', () => {
    render(<MarkdownViewer content={'- one\n- two\n- three'} filePath={TEST_FILE_PATH} />);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
  });

  it('renders a GFM table', () => {
    const table = [
      '| Name | Age |',
      '| ---- | --- |',
      '| Alice | 30 |',
    ].join('\n');
    render(<MarkdownViewer content={table} filePath={TEST_FILE_PATH} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders GFM task list checkboxes', () => {
    render(<MarkdownViewer content={'- [x] done\n- [ ] todo'} filePath={TEST_FILE_PATH} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('renders strikethrough text (GFM)', () => {
    render(<MarkdownViewer content={'~~strikethrough~~'} filePath={TEST_FILE_PATH} />);
    const del = document.querySelector('del');
    expect(del).not.toBeNull();
    expect(del?.textContent).toBe('strikethrough');
  });

  it('renders inline code', () => {
    render(<MarkdownViewer content={'Use `npm install` to install.'} filePath={TEST_FILE_PATH} />);
    expect(screen.getByText('npm install').tagName).toBe('CODE');
  });

  it('renders a fenced code block with hljs highlight classes applied', () => {
    const code = ['```js', 'const x = 1;', '```'].join('\n');
    render(<MarkdownViewer content={code} filePath={TEST_FILE_PATH} />);
    const codeEl = document.querySelector('pre code');
    expect(codeEl).not.toBeNull();
    expect(codeEl?.className).toContain('hljs');
    expect(codeEl?.className).toContain('language-js');
  });

  it('renders a mermaid code block as a diagram container instead of highlighted code', async () => {
    const code = ['```mermaid', 'graph TD;A-->B;', '```'].join('\n');
    render(<MarkdownViewer content={code} filePath={TEST_FILE_PATH} />);
    // Mermaid block should NOT render as a <pre><code> highlighted block
    expect(document.querySelector('pre code')).toBeNull();
    // It should render a container div instead (mermaid renders async, so
    // we just verify no raw code/pre element leaked through instead of it)
    expect(screen.queryByText(/graph TD/)).not.toBeInTheDocument();
  });

  it('rewrites a relative image src to the backend asset endpoint using the file directory', () => {
    render(
      <MarkdownViewer
        content={'![alt text](./images/logo.png)'}
        filePath={TEST_FILE_PATH}
      />,
    );
    const img = screen.getByRole('img', { name: 'alt text' });
    expect(img.getAttribute('src')).toBe(
      'http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fimages%2Flogo.png',
    );
  });

  it('leaves an absolute http image src unchanged', () => {
    render(
      <MarkdownViewer
        content={'![alt text](https://example.com/logo.png)'}
        filePath={TEST_FILE_PATH}
      />,
    );
    const img = screen.getByRole('img', { name: 'alt text' });
    expect(img.getAttribute('src')).toBe('https://example.com/logo.png');
  });
});
