import { RootLayout } from '@/app/layouts/root-layout';
import { AppProvider } from '@/app/providers/app-provider';
import { ViewerPage } from '@/pages/viewer-page';

export function App() {
  return (
    <AppProvider>
      <RootLayout>
        <ViewerPage />
      </RootLayout>
    </AppProvider>
  );
}
