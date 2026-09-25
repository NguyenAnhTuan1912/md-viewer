import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarTreeView } from './tree-view';
import { useOpenTabsStore } from '@/stores/open-tabs.store';
import { useExpandedItemsStore } from '@/stores/expanded-items.store';
import type { Source, SourceTree } from '@/types/api';

const mockTree: SourceTree = {
  sourceId: 'source-1',
  sourceName: 'demo-docs',
  tree: [
    {
      name: 'guides',
      path: '/tmp/demo-docs/guides',
      type: 'folder',
      children: [
        {
          name: 'getting-started.md',
          path: '/tmp/demo-docs/guides/getting-started.md',
          type: 'file',
          extension: '.md',
        },
      ],
    },
    {
      name: 'readme.md',
      path: '/tmp/demo-docs/readme.md',
      type: 'file',
      extension: '.md',
    },
  ],
};

const sources: Source[] = [
  {
    id: 'source-1',
    path: '/tmp/demo-docs',
    name: 'demo-docs',
    addedAt: '2024-01-01T00:00:00.000Z',
  },
];

vi.mock('./use-source-tree', () => ({
  useSourceTrees: () => [
    { data: mockTree, isLoading: false, isError: false },
  ],
}));

vi.mock('./use-sync-node', () => ({
  useSyncNode: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  }),
}));

function renderTree() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SidebarTreeView sources={sources} />
    </QueryClientProvider>,
  );
}

describe('SidebarTreeView', () => {
  beforeEach(() => {
    useOpenTabsStore.setState({ tabs: [], activeTabPath: null, focusHistory: [] });
    useExpandedItemsStore.setState({ expandedItems: [] });
  });

  it('renders the source root and top-level nodes', () => {
    renderTree();
    expect(screen.getByText('demo-docs')).toBeInTheDocument();
    expect(screen.getByText('guides')).toBeInTheDocument();
    expect(screen.getByText('readme.md')).toBeInTheDocument();
  });

  it('does not show nested file until folder is expanded', () => {
    renderTree();
    expect(screen.queryByText('getting-started.md')).not.toBeInTheDocument();
  });

  it('expands a folder on click to reveal nested files', () => {
    renderTree();
    fireEvent.click(screen.getByText('guides'));
    expect(screen.getByText('getting-started.md')).toBeInTheDocument();
  });

  it('opens a tab in the store when a file is clicked', () => {
    renderTree();
    fireEvent.click(screen.getByText('readme.md'));
    expect(useOpenTabsStore.getState().activeTabPath).toBe(
      '/tmp/demo-docs/readme.md',
    );
    expect(useOpenTabsStore.getState().tabs).toHaveLength(1);
    expect(useOpenTabsStore.getState().tabs[0].name).toBe('readme.md');
  });

  it('does not duplicate a tab when clicking the same file twice', () => {
    renderTree();
    fireEvent.click(screen.getByText('readme.md'));
    fireEvent.click(screen.getByText('readme.md'));
    expect(useOpenTabsStore.getState().tabs).toHaveLength(1);
  });

  it('shows empty state when there are no sources', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SidebarTreeView sources={[]} />
      </QueryClientProvider>,
    );
    expect(screen.getByText('No sources added yet')).toBeInTheDocument();
  });

  it('auto-expands ancestor folders of an already-active tab on mount (simulating reload)', () => {
    // Simulate the persisted state after a reload: a nested file is active,
    // but the folder containing it has not been expanded in this session yet.
    useOpenTabsStore.setState({
      tabs: [
        {
          path: '/tmp/demo-docs/guides/getting-started.md',
          name: 'getting-started.md',
          type: 'markdown',
        },
      ],
      activeTabPath: '/tmp/demo-docs/guides/getting-started.md',
      focusHistory: [],
    });

    renderTree();

    // The nested file should be visible without needing to manually expand
    // the "guides" folder first.
    expect(screen.getByText('getting-started.md')).toBeInTheDocument();
  });

  it('sync button has no hover background (only icon should react to hover)', () => {
    renderTree();
    const syncButton = screen.getByRole('button', { name: 'Sync guides' });
    expect(syncButton.className).toContain('hover:bg-transparent');
  });
});
