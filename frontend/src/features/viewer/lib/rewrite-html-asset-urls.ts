import { resolveAssetUrl } from '@/features/viewer/lib/resolve-asset-url';

const ASSET_ATTRIBUTES: Array<{ selector: string; attribute: string }> = [
  { selector: 'img', attribute: 'src' },
  { selector: 'source', attribute: 'src' },
  { selector: 'link[rel="stylesheet"]', attribute: 'href' },
  { selector: 'link[rel="icon"]', attribute: 'href' },
  { selector: 'link[rel="shortcut icon"]', attribute: 'href' },
  { selector: 'script[src]', attribute: 'src' },
  { selector: 'audio', attribute: 'src' },
  { selector: 'video', attribute: 'src' },
  { selector: 'embed', attribute: 'src' },
];

/**
 * Rewrites relative asset references (img/src, link/href for stylesheets,
 * script/src, etc.) found in a raw HTML string so they resolve against the
 * backend's `/files/asset` endpoint using the directory of the file being
 * previewed, instead of resolving against the SPA's own origin (which is
 * where the browser would otherwise look them up when the string is
 * injected via an iframe's `srcDoc`).
 */
export function rewriteHtmlAssetUrls(
  html: string,
  currentFilePath: string,
  sourceRoot?: string,
): string {
  if (typeof DOMParser === 'undefined') {
    // Non-browser environment (shouldn't normally happen); return as-is.
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  for (const { selector, attribute } of ASSET_ATTRIBUTES) {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => {
      const value = el.getAttribute(attribute);
      const resolved = resolveAssetUrl(value, currentFilePath, sourceRoot);
      if (resolved !== undefined && resolved !== value) {
        el.setAttribute(attribute, resolved);
      }
    });
  }

  // srcset can contain multiple comma-separated "<url> <descriptor>" pairs.
  doc.querySelectorAll('img[srcset], source[srcset]').forEach((el) => {
    const srcset = el.getAttribute('srcset');
    if (!srcset) {
      return;
    }
    const rewritten = srcset
      .split(',')
      .map((entry) => {
        const trimmed = entry.trim();
        const [url, ...descriptor] = trimmed.split(/\s+/);
        const resolved = resolveAssetUrl(url, currentFilePath, sourceRoot) ?? url;
        return [resolved, ...descriptor].join(' ');
      })
      .join(', ');
    el.setAttribute('srcset', rewritten);
  });

  // Preserve the original document structure (doctype, html/head/body).
  const doctype = doc.doctype
    ? `<!DOCTYPE ${doc.doctype.name}>`
    : '';
  return `${doctype}${doc.documentElement.outerHTML}`;
}
