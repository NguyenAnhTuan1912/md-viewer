import { useEffect } from "react";

// Import components
import { RootLayout } from "@/app/layouts/root-layout";
import { ViewerPage } from "@/pages/viewer-page";

// Import providers
import { AppProvider } from "@/app/providers/app-provider";

// Import stores
import { useOpenTabsStore } from "@/features/viewer/store/open-tabs-store";
import { expandedItemsStoreActions } from "@/features/sidebar-tree/store/expanded-items-store";

export function App() {
  useEffect(() => {
    const activeTabPath = useOpenTabsStore.getState().activeTabPath;
    if (activeTabPath)
      expandedItemsStoreActions.setExpandedItems([activeTabPath]);
  }, []);

  return (
    <AppProvider>
      <RootLayout>
        <ViewerPage />
      </RootLayout>
    </AppProvider>
  );
}
