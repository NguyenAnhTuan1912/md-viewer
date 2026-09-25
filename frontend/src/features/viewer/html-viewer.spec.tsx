import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { HtmlViewer } from './html-viewer';

describe('HtmlViewer', () => {
  it('renders an iframe with the given content as srcDoc', () => {
    const { container } = render(<HtmlViewer content="<h1>Hello</h1>" />);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('srcdoc')).toBe('<h1>Hello</h1>');
  });

  it('applies a sandbox that allows scripts to run (e.g. Tailwind CDN) alongside same-origin', () => {
    const { container } = render(<HtmlViewer content="<p>test</p>" />);
    const iframe = container.querySelector('iframe');
    const sandbox = iframe?.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-same-origin');
    expect(sandbox).toContain('allow-scripts');
  });

  it('has an accessible title', () => {
    const { container } = render(<HtmlViewer content="<p>test</p>" />);
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('title')).toBe('HTML preview');
  });
});
