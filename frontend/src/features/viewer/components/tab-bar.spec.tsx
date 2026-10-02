import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabBar } from '@/features/viewer/components/tab-bar';
import {
  useOpenTabsStore,
  openTabsStoreActions,
} from '@/features/viewer/store/open-tabs-store';

describe('TabBar', () => {
  beforeEach(() => {
    useOpenTabsStore.setState({ tabs: [], activeTabPath: null, focusHistory: [] });
  });

  it('renders nothing when there are no open tabs', () => {
    const { container } = render(<TabBar />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a tab for each open file', () => {
    openTabsStoreActions.openTab({ path: '/a.md', name: 'a.md', type: 'markdown' });
    openTabsStoreActions.openTab({ path: '/b.html', name: 'b.html', type: 'html' });

    render(<TabBar />);
    expect(screen.getByText('a.md')).toBeInTheDocument();
    expect(screen.getByText('b.html')).toBeInTheDocument();
  });

  it('marks the active tab as selected', () => {
    openTabsStoreActions.openTab({ path: '/a.md', name: 'a.md', type: 'markdown' });
    render(<TabBar />);
    expect(screen.getByRole('tab', { name: /a\.md/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('clicking a tab focuses it', () => {
    openTabsStoreActions.openTab({ path: '/a.md', name: 'a.md', type: 'markdown' });
    openTabsStoreActions.openTab({ path: '/b.md', name: 'b.md', type: 'markdown' });
    render(<TabBar />);

    fireEvent.click(screen.getByText('a.md'));
    expect(useOpenTabsStore.getState().activeTabPath).toBe('/a.md');
  });

  it('clicking the close button removes the tab', () => {
    openTabsStoreActions.openTab({ path: '/a.md', name: 'a.md', type: 'markdown' });
    render(<TabBar />);

    fireEvent.click(screen.getByRole('button', { name: 'Close a.md' }));
    expect(useOpenTabsStore.getState().tabs).toHaveLength(0);
  });
});
