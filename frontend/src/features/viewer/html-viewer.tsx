interface HtmlViewerProps {
  content: string;
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
 */
export function HtmlViewer({ content }: HtmlViewerProps) {
  return (
    <iframe
      title="HTML preview"
      srcDoc={content}
      sandbox="allow-same-origin allow-scripts"
      className="h-full w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0"
    />
  );
}
