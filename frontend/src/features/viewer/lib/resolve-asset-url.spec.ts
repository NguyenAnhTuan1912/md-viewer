import { describe, expect, it } from 'vitest';
import { resolveAssetUrl } from '@/features/viewer/lib/resolve-asset-url';

const currentFile = '/tmp/demo-docs/guides/readme.md';

describe('resolveAssetUrl', () => {
  it('resolves a same-directory relative reference (no prefix)', () => {
    expect(resolveAssetUrl('logo.png', currentFile)).toBe(
      'http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fguides%2Flogo.png',
    );
  });

  it('resolves a ./ prefixed relative reference', () => {
    expect(resolveAssetUrl('./images/logo.png', currentFile)).toBe(
      'http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fguides%2Fimages%2Flogo.png',
    );
  });

  it('resolves a ../ parent-relative reference', () => {
    expect(resolveAssetUrl('../assets/logo.png', currentFile)).toBe(
      'http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fassets%2Flogo.png',
    );
  });

  it('resolves multiple ../ segments', () => {
    expect(resolveAssetUrl('../../logo.png', currentFile)).toBe(
      'http://localhost:19121/files/asset?path=%2Ftmp%2Flogo.png',
    );
  });

  it('resolves a leading-slash reference relative to the source root when provided', () => {
    expect(
      resolveAssetUrl('/images/logo.png', currentFile, '/tmp/demo-docs'),
    ).toBe(
      'http://localhost:19121/files/asset?path=%2Ftmp%2Fdemo-docs%2Fimages%2Flogo.png',
    );
  });

  it('falls back to treating a leading-slash reference as a literal absolute path when no sourceRoot is given', () => {
    expect(resolveAssetUrl('/images/logo.png', currentFile)).toBe(
      'http://localhost:19121/files/asset?path=%2Fimages%2Flogo.png',
    );
  });

  it('leaves absolute http(s) URLs unchanged', () => {
    expect(resolveAssetUrl('https://example.com/logo.png', currentFile)).toBe(
      'https://example.com/logo.png',
    );
    expect(resolveAssetUrl('http://example.com/logo.png', currentFile)).toBe(
      'http://example.com/logo.png',
    );
  });

  it('leaves protocol-relative URLs unchanged', () => {
    expect(resolveAssetUrl('//example.com/logo.png', currentFile)).toBe(
      '//example.com/logo.png',
    );
  });

  it('leaves data: URLs unchanged', () => {
    const dataUrl = 'data:image/png;base64,AAAA';
    expect(resolveAssetUrl(dataUrl, currentFile)).toBe(dataUrl);
  });

  it('leaves mailto: and tel: links unchanged', () => {
    expect(resolveAssetUrl('mailto:a@b.com', currentFile)).toBe(
      'mailto:a@b.com',
    );
    expect(resolveAssetUrl('tel:+123456', currentFile)).toBe('tel:+123456');
  });

  it('leaves in-page anchor references unchanged', () => {
    expect(resolveAssetUrl('#section-1', currentFile)).toBe('#section-1');
  });

  it('returns undefined for empty/undefined/null input', () => {
    expect(resolveAssetUrl(undefined, currentFile)).toBeUndefined();
    expect(resolveAssetUrl(null, currentFile)).toBeUndefined();
    expect(resolveAssetUrl('', currentFile)).toBeUndefined();
  });
});
