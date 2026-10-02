import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/cn';
import { resolveAssetUrl } from '@/features/viewer/lib/resolve-asset-url';
import { MermaidDiagram } from '@/features/viewer/components/mermaid-diagram';
import { useHighlightTheme } from '@/features/viewer/hooks/use-highlight-theme';

function extractLanguage(className?: string): string | null {
  const match = /language-(\w+)/.exec(className ?? '');
  return match ? match[1] : null;
}

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join('');
  }
  if (
    React.isValidElement<{ children?: React.ReactNode }>(children) &&
    children.props.children
  ) {
    return extractText(children.props.children);
  }
  return '';
}

function createComponents(
  currentFilePath: string,
  sourceRoot?: string,
): Components {
  return {
  h1: ({ className, ...rest }) => (
    <h1
      className={cn(
        'text-title-h4 mt-10 mb-5 border-b border-stroke-soft-200 pb-3 text-text-strong-950 first:mt-0',
        className,
      )}
      {...rest}
    />
  ),
  h2: ({ className, children, ...rest }) => (
    <h2
      className={cn(
        'text-title-h5 mt-9 mb-4 flex items-start gap-2.5 text-text-strong-950 first:mt-0',
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="mt-1 h-5 w-1 shrink-0 rounded-full bg-primary-base"
      />
      <span>{children}</span>
    </h2>
  ),
  h3: ({ className, ...rest }) => (
    <h3 className={cn('text-title-h6 mt-8 mb-3 text-primary-base first:mt-0', className)} {...rest} />
  ),
  h4: ({ className, ...rest }) => (
    <h4 className={cn('text-label-lg mt-6 mb-2 text-text-strong-950 first:mt-0', className)} {...rest} />
  ),
  h5: ({ className, ...rest }) => (
    <h5 className={cn('text-label-md mt-5 mb-2 text-text-strong-950 first:mt-0', className)} {...rest} />
  ),
  h6: ({ className, ...rest }) => (
    <h6
      className={cn(
        'text-subheading-xs mt-5 mb-2 uppercase tracking-wide text-text-soft-400 first:mt-0',
        className,
      )}
      {...rest}
    />
  ),
  p: ({ className, ...rest }) => (
    <p className={cn('text-paragraph-md mb-4 leading-[1.75] text-text-sub-600', className)} {...rest} />
  ),
  strong: ({ className, ...rest }) => (
    <strong className={cn('font-semibold text-text-strong-950', className)} {...rest} />
  ),
  em: ({ className, ...rest }) => (
    <em className={cn('text-text-strong-950', className)} {...rest} />
  ),
  a: ({ className, ...rest }) => (
    <a
      className={cn(
        'font-medium text-primary-base underline decoration-primary-alpha-24 decoration-2 underline-offset-2 transition-colors hover:text-primary-darker hover:decoration-primary-base',
        className,
      )}
      {...rest}
    />
  ),
  ul: ({ className, ...rest }) => (
    <ul
      className={cn(
        'mb-4 list-none space-y-2 pl-1 text-paragraph-md text-text-sub-600',
        '[&>li]:relative [&>li]:pl-6',
        "[&>li::before]:absolute [&>li::before]:left-1 [&>li::before]:top-[0.7em] [&>li::before]:size-1.5 [&>li::before]:rounded-full [&>li::before]:bg-primary-alpha-24 [&>li::before]:content-['']",
        className,
      )}
      {...rest}
    />
  ),
  ol: ({ className, ...rest }) => (
    <ol
      className={cn(
        'mb-4 list-decimal space-y-2 pl-6 text-paragraph-md text-text-sub-600 marker:font-semibold marker:text-primary-base',
        className,
      )}
      {...rest}
    />
  ),
  li: ({ className, ...rest }) => (
    <li className={cn('leading-relaxed', className)} {...rest} />
  ),
  blockquote: ({ className, ...rest }) => (
    <blockquote
      className={cn(
        'mb-4 rounded-r-lg border-l-4 border-primary-base bg-primary-alpha-10 py-3 pl-4 pr-4 text-paragraph-md text-text-sub-600 [&>p]:mb-0',
        className,
      )}
      {...rest}
    />
  ),
  hr: ({ className, ...rest }) => (
    <hr
      className={cn(
        'my-8 border-0 bg-gradient-to-r from-transparent via-stroke-soft-200 to-transparent',
        className,
      )}
      style={{ height: '1px' }}
      {...rest}
    />
  ),
  table: ({ className, ...rest }) => (
    <div className="mb-4 overflow-x-auto rounded-lg ring-1 ring-stroke-soft-200">
      <table className={cn('w-full border-collapse text-paragraph-sm', className)} {...rest} />
    </div>
  ),
  thead: ({ className, ...rest }) => (
    <thead className={cn('bg-bg-weak-50', className)} {...rest} />
  ),
  th: ({ className, ...rest }) => (
    <th
      className={cn(
        'border-b border-stroke-soft-200 px-3.5 py-2.5 text-left text-label-xs text-text-strong-950',
        className,
      )}
      {...rest}
    />
  ),
  td: ({ className, ...rest }) => (
    <td
      className={cn(
        'border-b border-stroke-soft-200 px-3.5 py-2.5 text-text-sub-600 last:border-b-0',
        className,
      )}
      {...rest}
    />
  ),
  tr: ({ className, ...rest }) => (
    <tr className={cn('transition-colors even:bg-bg-weak-50/50', className)} {...rest} />
  ),
  input: ({ className, type, ...rest }) =>
    type === 'checkbox' ? (
      <input type="checkbox" disabled className={cn('mr-2 size-4 accent-primary-base', className)} {...rest} />
    ) : (
      <input type={type} className={className} {...rest} />
    ),
  img: ({ className, src, ...rest }) => (
    <img
      className={cn('mb-4 max-w-full rounded-lg shadow-regular-md ring-1 ring-stroke-soft-200', className)}
      src={resolveAssetUrl(typeof src === 'string' ? src : undefined, currentFilePath, sourceRoot)}
      {...rest}
    />
  ),
  code: ({ className, children, ...rest }) => {
    // Inline code (no language class, not inside a highlighted pre block)
    if (!className) {
      return (
        <code
          className={cn(
            'rounded-md bg-primary-alpha-10 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-primary-darker',
          )}
          {...rest}
        >
          {children}
        </code>
      );
    }

    // Block code already highlighted by rehype-highlight (hljs classes present)
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
  pre: ({ className, children, ...rest }) => {
    const codeElement = React.isValidElement<{ className?: string; children?: React.ReactNode }>(children)
      ? children
      : null;
    const language = extractLanguage(codeElement?.props.className);

    if (language === 'mermaid') {
      const code = extractText(codeElement?.props.children);
      return <MermaidDiagram code={code} />;
    }

    return (
      <div className="group relative mb-5">
        {language && (
          <span className="absolute right-3 top-2.5 z-10 text-subheading-2xs uppercase tracking-wide text-text-soft-400 opacity-0 transition-opacity group-hover:opacity-100">
            {language}
          </span>
        )}
        <pre
          className={cn(
            'overflow-x-auto rounded-xl bg-bg-weak-50 p-4 font-mono text-paragraph-xs shadow-regular-xs ring-1 ring-stroke-soft-200',
            className,
          )}
          {...rest}
        >
          {children}
        </pre>
      </div>
    );
  },
  };
}

interface IMarkdownViewerProps {
  content: string;
  filePath: string;
  sourceRoot?: string;
}

export function MarkdownViewer({ content, filePath, sourceRoot }: IMarkdownViewerProps) {
  useHighlightTheme();

  const components = React.useMemo(
    () => createComponents(filePath, sourceRoot),
    [filePath, sourceRoot],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
