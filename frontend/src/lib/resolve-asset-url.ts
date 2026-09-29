import { API_BASE_URL } from '@/lib/api-client';

const ABSOLUTE_URL_PATTERN = /^([a-z][a-z0-9+.-]*:)?\/\//i;
const NON_FILE_SCHEME_PATTERN = /^(data|blob|mailto|tel):/i;

/**
 * Joins path segments and collapses `.`/`..`, POSIX-style (matches how the
 * backend resolves paths on disk regardless of the browser's own URL/host).
 */
function joinPosixPath(base: string, relative: string): string {
  const baseSegments = base.split('/').filter(Boolean);
  const relativeSegments = relative.split('/');

  const segments = [...baseSegments];
  for (const segment of relativeSegments) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      segments.pop();
    } else {
      segments.push(segment);
    }
  }

  return `/${segments.join('/')}`;
}

/**
 * Resolves a possibly-relative asset reference (e.g. an <img src>, `href`,
 * or `url()` found inside a rendered Markdown/HTML file) into an absolute
 * URL that routes through the backend's `/files/asset` endpoint, so the
 * browser fetches it from its real location on disk instead of resolving
 * it against the SPA's own origin/route.
 *
 * - Full URLs (http://, https://, protocol-relative //) and non-file
 *   schemes (data:, blob:, mailto:, tel:) are returned unchanged.
 * - A reference starting with `/` is treated as relative to the root of
 *   the current file's source folder (the common convention in
 *   Markdown/HTML documents, e.g. `/images/logo.png` meaning "this
 *   document's images folder"), not the real filesystem root. Falls back
 *   to treating it as a literal absolute filesystem path if `sourceRoot`
 *   is not provided.
 * - Anything else (`./foo.png`, `../foo.png`, `foo.png`) is resolved
 *   relative to the directory of the file currently being viewed.
 */
export function resolveAssetUrl(
  assetRef: string | undefined | null,
  currentFilePath: string,
  sourceRoot?: string,
): string | undefined {
  if (!assetRef) {
    return undefined;
  }

  const trimmed = assetRef.trim();
  if (
    trimmed === '' ||
    ABSOLUTE_URL_PATTERN.test(trimmed) ||
    NON_FILE_SCHEME_PATTERN.test(trimmed) ||
    trimmed.startsWith('#')
  ) {
    return assetRef;
  }

  let absolutePath: string;
  if (trimmed.startsWith('/')) {
    absolutePath = sourceRoot
      ? joinPosixPath(sourceRoot, trimmed)
      : trimmed;
  } else {
    absolutePath = joinPosixPath(
      currentFilePath.slice(0, currentFilePath.lastIndexOf('/')),
      trimmed,
    );
  }

  return `${API_BASE_URL}/files/asset?path=${encodeURIComponent(absolutePath)}`;
}
