import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { queryClient } from "@/lib/queryClient";
import Router from "./Router";
import BackToTop from "@/components/ui/back-to-top";
import PerformanceMetrics from "@/components/ui/performance-metrics";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="dapsiwow-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
            <BackToTop />
            <PerformanceMetrics />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;