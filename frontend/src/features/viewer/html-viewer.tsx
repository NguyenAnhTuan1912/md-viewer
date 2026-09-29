import { useMemo } from 'react';
import { rewriteHtmlAssetUrls } from './rewrite-html-asset-urls';

interface HtmlViewerProps {
  content: string;
  filePath: string;
  sourceRoot?: string;
}

/**
 * Renders raw HTML content inside a sandboxed iframe.
 *
 * Sandbox grants `allow-same-origin` and `allow-scripts` so files that rely
 * on inline/CDN scripts (e.g. the Tailwind CDN JIT compiler) render with
 * their intended styling. The iframe is still sandboxed (isolated from the
 * app's origin/storage/parent DOM) and has no `allow-popups`,
 * `allow-forms`, `allow-top-navigation`, etc., but note this means any
 * `<script>` in previewed HTML DOES execute — only open local files you
 * trust with this viewer.
 *
 * Before injecting the HTML, relative asset references (img/src, stylesheet
 * link/href, script/src, etc.) are rewritten to route through the backend's
 * `/files/asset` endpoint, resolved against the directory of `filePath` —
 * otherwise the browser would resolve them against the SPA's own origin
 * and they would 404.
 */
export function HtmlViewer({ content, filePath, sourceRoot }: HtmlViewerProps) {
  const rewrittenContent = useMemo(
    () => rewriteHtmlAssetUrls(content, filePath, sourceRoot),
    [content, filePath, sourceRoot],
  );

  return (
    <iframe
      title="HTML preview"
      srcDoc={rewrittenContent}
      sandbox="allow-same-origin allow-scripts"
      className="h-full w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0"
    />
  );
}
