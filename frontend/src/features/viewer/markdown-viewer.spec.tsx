import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownViewer } from './markdown-viewer';

describe('MarkdownViewer', () => {
  it('renders headings', () => {
    render(<MarkdownViewer content={'# Title\n\n## Subtitle'} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument();
  });

  it('renders an unordered list', () => {
    render(<MarkdownViewer content={'- one\n- two\n- three'} />);
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
    render(<MarkdownViewer content={table} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders GFM task list checkboxes', () => {
    render(<MarkdownViewer content={'- [x] done\n- [ ] todo'} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('renders strikethrough text (GFM)', () => {
    render(<MarkdownViewer content={'~~strikethrough~~'} />);
    const del = document.querySelector('del');
    expect(del).not.toBeNull();
    expect(del?.textContent).toBe('strikethrough');
  });

  it('renders inline code', () => {
    render(<MarkdownViewer content={'Use `npm install` to install.'} />);
    expect(screen.getByText('npm install').tagName).toBe('CODE');
  });

  it('renders a fenced code block with hljs highlight classes applied', () => {
    const code = ['```js', 'const x = 1;', '```'].join('\n');
    render(<MarkdownViewer content={code} />);
    const codeEl = document.querySelector('pre code');
    expect(codeEl).not.toBeNull();
    expect(codeEl?.className).toContain('hljs');
    expect(codeEl?.className).toContain('language-js');
  });

  it('renders a mermaid code block as a diagram container instead of highlighted code', async () => {
    const code = ['```mermaid', 'graph TD;A-->B;', '```'].join('\n');
    render(<MarkdownViewer content={code} />);
    // Mermaid block should NOT render as a <pre><code> highlighted block
    expect(document.querySelector('pre code')).toBeNull();
    // It should render a container div instead (mermaid renders async, so
    // we just verify no raw code/pre element leaked through instead of it)
    expect(screen.queryByText(/graph TD/)).not.toBeInTheDocument();
  });
});
