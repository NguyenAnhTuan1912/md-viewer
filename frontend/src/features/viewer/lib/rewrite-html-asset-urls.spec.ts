import { describe, expect, it } from 'vitest';
import { rewriteHtmlAssetUrls } from '@/features/viewer/lib/rewrite-html-asset-urls';

const FILE_PATH = '/tmp/demo-docs/page.html';

describe('rewriteHtmlAssetUrls', () => {
  it('rewrites a relative img src', () => {
    const html = '<html><body><img src="./images/logo.png"></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain(
      'src="http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fimages%2Flogo.png"',
    );
  });

  it('rewrites a root-relative img src as an absolute filesystem path', () => {
    const html = '<html><body><img src="/images/logo.png"></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain(
      'src="http://localhost:19121/files/asset?path=%2Fimages%2Flogo.png"',
    );
  });

  it('rewrites a stylesheet link href', () => {
    const html =
      '<html><head><link rel="stylesheet" href="./css/style.css"></head><body></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain(
      'href="http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fcss%2Fstyle.css"',
    );
  });

  it('leaves an absolute http img src unchanged', () => {
    const html = '<html><body><img src="https://cdn.example.com/logo.png"></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain('src="https://cdn.example.com/logo.png"');
  });

  it('leaves script CDN src (e.g. Tailwind CDN) unchanged', () => {
    const html =
      '<html><head><script src="https://cdn.tailwindcss.com"></script></head><body></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain('src="https://cdn.tailwindcss.com"');
  });

  it('rewrites a relative script src', () => {
    const html = '<html><body><script src="./scripts/main.js"></script></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain(
      'src="http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fscripts%2Fmain.js"',
    );
  });

  it('rewrites srcset entries while preserving descriptors', () => {
    const html =
      '<html><body><img srcset="./img-1x.png 1x, ./img-2x.png 2x"></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain(
      'srcset="http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fimg-1x.png 1x, http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fimg-2x.png 2x"',
    );
  });

  it('preserves other document content and structure', () => {
    const html = '<html><body><h1>Hello</h1><p>World</p></body></html>';
    const result = rewriteHtmlAssetUrls(html, FILE_PATH);
    expect(result).toContain('<h1>Hello</h1>');
    expect(result).toContain('<p>World</p>');
  });
});
