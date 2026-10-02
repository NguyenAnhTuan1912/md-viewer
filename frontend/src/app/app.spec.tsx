import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app/app';
import { queryClient } from '@/app/providers/query-client';
import {
  useExpandedItemsStore,
} from '@/features/sidebar-tree/store/expanded-items-store';
import { useThemeStore } from '@/features/theme/store/theme-store';
import { useOpenTabsStore } from '@/features/viewer/store/open-tabs-store';

const source = {
  id: 'docs',
  name: 'Docs',
  path: '/docs',
  addedAt: '2024-01-01T00:00:00.000Z',
};

function mockApi(type: 'markdown' | 'html' = 'markdown') {
  const extension = type === 'markdown' ? 'md' : 'html';
  const filePath = `/docs/nested/readme.${extension}`;
  const fetchMock = vi.fn(async (input: string) => {
    const url = new URL(input);
    let body: unknown;
    if (url.pathname === '/sources') {
      body = [source, { ...source, id: 'nested', path: '/docs/nested', name: 'Nested' }];
    } else if (url.pathname.endsWith('/tree')) {
      body = {
        sourceId: 'docs',
        sourceName: 'Docs',
        tree: url.pathname === '/sources/docs/tree'
          ? [{ name: `readme.${extension}`, path: filePath, type: 'file', extension: `.${extension}` }]
          : [],
      };
    } else if (url.pathname === '/files/content') {
      body = {
        type,
        content: type === 'markdown'
          ? '# Preview title\n\n![Example](/image.png)'
          : '<h1>Preview title</h1><img src="/image.png">',
      };
    } else {
      throw new Error(`Unexpected request: ${input}`);
    }
    return new Response(JSON.stringify(body), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, filePath, extension };
}

describe('application composition', () => {
  beforeEach(() => {
    queryClient.clear();
    localStorage.clear();
    useOpenTabsStore.setState({ tabs: [], activeTabPath: null, focusHistory: [] });
    useExpandedItemsStore.setState({ expandedItems: [] });
    useThemeStore.setState({ isDarkMode: false });
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('dark');
  });

  it.each(['markdown', 'html'] as const)(
    'restores a persisted %s tab and resolves assets against the nearest source',
    async (type) => {
      const { fetchMock, filePath, extension } = mockApi(type);
      localStorage.setItem('md-viewer-open-tabs', JSON.stringify({
        state: {
          tabs: [{ path: filePath, name: `readme.${extension}`, type }],
          activeTabPath: filePath,
          focusHistory: [],
        },
        version: 0,
      }));
      await useOpenTabsStore.persist.rehydrate();
      render(<App />);

      if (type === 'markdown') {
        expect(await screen.findByRole('heading', { name: 'Preview title' })).toBeInTheDocument();
        expect(screen.getByAltText('Example')).toHaveAttribute(
          'src',
          'http://localhost:19121/files/asset?path=%2Fdocs%2Fnested%2Fimage.png',
        );
      } else {
        const frame = await screen.findByTitle('HTML preview');
        expect(frame.getAttribute('srcdoc')).toContain('path=%2Fdocs%2Fnested%2Fimage.png');
      }
      expect(fetchMock).toHaveBeenCalledWith(
        `http://localhost:19121/files/content?path=${encodeURIComponent(filePath)}`,
        expect.objectContaining({ method: 'GET' }),
      );
      expect(screen.getByRole('tab')).toHaveAttribute('aria-selected', 'true');

      fireEvent.click(screen.getByRole('button', { name: `Close readme.${extension}` }));
      expect(screen.getByText('Select a file from the sidebar to preview it here.')).toBeInTheDocument();
    },
  );

  it('opens a file from the sidebar after tree data arrives asynchronously', async () => {
    mockApi();
    render(<App />);
    expect(screen.getByText('Select a file from the sidebar to preview it here.')).toBeInTheDocument();
    fireEvent.click(await screen.findByText('readme.md'));
    expect(await screen.findByRole('heading', { name: 'Preview title' })).toBeInTheDocument();
    expect(screen.getByRole('tab')).toHaveAttribute('aria-selected', 'true');
  });

  it('synchronizes the theme through the layout and provider and persists it', async () => {
    mockApi();
    render(<App />);
    fireEvent.click(screen.getByRole('switch', { name: 'Toggle dark mode' }));
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(JSON.parse(localStorage.getItem('md-viewer-theme')!).state).toEqual({ isDarkMode: true });
  });
});
