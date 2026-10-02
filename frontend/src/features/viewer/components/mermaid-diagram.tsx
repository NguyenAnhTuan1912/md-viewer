import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useThemeStore } from '@/features/theme/store/theme-store';

interface IMermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: IMermaidDiagramProps) {
  const containerId = useId().replace(/:/g, '-');
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    let isCancelled = false;

    async function renderDiagram() {
      setError(null);
      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'strict',
      });

      try {
        const { svg } = await mermaid.render(`mermaid-${containerId}`, code);
        if (!isCancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    }

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [code, containerId, isDarkMode]);

  if (error) {
    return (
      <div className="mb-4 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4 text-paragraph-xs text-error-base">
        Failed to render Mermaid diagram: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mb-4 flex justify-center overflow-x-auto rounded-lg bg-bg-weak-50 p-4"
    />
  );
}
