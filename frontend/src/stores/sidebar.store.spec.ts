import { beforeEach, describe, expect, it } from 'vitest';
import {
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  useSidebarStore,
} from './sidebar.store';

describe('useSidebarStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSidebarStore.setState({ width: SIDEBAR_DEFAULT_WIDTH });
  });

  it('defaults to the default width', () => {
    expect(useSidebarStore.getState().width).toBe(SIDEBAR_DEFAULT_WIDTH);
  });

  it('setWidth updates the width within bounds', () => {
    useSidebarStore.getState().setWidth(320);
    expect(useSidebarStore.getState().width).toBe(320);
  });

  it('clamps width below the minimum', () => {
    useSidebarStore.getState().setWidth(50);
    expect(useSidebarStore.getState().width).toBe(SIDEBAR_MIN_WIDTH);
  });

  it('clamps width above the maximum', () => {
    useSidebarStore.getState().setWidth(1000);
    expect(useSidebarStore.getState().width).toBe(SIDEBAR_MAX_WIDTH);
  });

  it('persists width to localStorage', () => {
    useSidebarStore.getState().setWidth(300);
    const stored = localStorage.getItem('md-viewer-sidebar');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.width).toBe(300);
  });
});
