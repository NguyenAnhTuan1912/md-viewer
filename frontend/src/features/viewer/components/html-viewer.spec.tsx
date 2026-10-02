import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { HtmlViewer } from '@/features/viewer/components/html-viewer';

const TEST_FILE_PATH = '/tmp/demo-docs/page.html';

describe('HtmlViewer', () => {
  it('renders an iframe with the (asset-rewritten) content as srcDoc', () => {
    const { container } = render(
      <HtmlViewer content="<h1>Hello</h1>" filePath={TEST_FILE_PATH} />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('srcdoc')).toContain('<h1>Hello</h1>');
  });

  it('applies a sandbox that allows scripts to run (e.g. Tailwind CDN) alongside same-origin', () => {
    const { container } = render(
      <HtmlViewer content="<p>test</p>" filePath={TEST_FILE_PATH} />,
    );
    const iframe = container.querySelector('iframe');
    const sandbox = iframe?.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-same-origin');
    expect(sandbox).toContain('allow-scripts');
  });

  it('has an accessible title', () => {
    const { container } = render(
      <HtmlViewer content="<p>test</p>" filePath={TEST_FILE_PATH} />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('title')).toBe('HTML preview');
  });

  it('rewrites a relative image src to route through the backend asset endpoint', () => {
    const { container } = render(
      <HtmlViewer
        content='<img src="./images/logo.png">'
        filePath={TEST_FILE_PATH}
      />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('srcdoc')).toContain(
      'src="http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fimages%2Flogo.png"',
    );
  });
});
