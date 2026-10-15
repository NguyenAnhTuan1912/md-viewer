import { useEffect, type PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

// Import components
import { Toaster } from "@/components/ui/toast";
import * as Tooltip from "@/components/ui/tooltip";

// Import stores
import { useThemeStore } from "@/features/theme/store/theme-store";

import { queryClient } from "@/app/providers/query-client";

export function AppProvider({ children }: PropsWithChildren) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme={isDarkMode ? "dark" : "light"} />
      <Tooltip.Provider>
        {children}
      </Tooltip.Provider>
    </QueryClientProvider>
  );
}
