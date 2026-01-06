import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useRealtimeSettings } from "@/hooks/useRealtimeSettings";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProjectPage from "./pages/AdminAddProjectPage";
import SubmitProjectPage from "./pages/SubmitProjectPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectsPortfolioPage from "./pages/ProjectsPortfolioPage";
import PortoDeIdeiasPage from "./pages/PortoDeIdeiasPage";
import ExampleProjectPage from "./pages/ExampleProjectPage";
import PendingProjectPage from "./pages/PendingProjectPage";
import DevMenu from "./pages/DevMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to initialize realtime sync
const RealtimeSync = () => {
  useRealtimeSettings();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          <RealtimeSync />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />

              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/add-project" element={<AdminAddProjectPage />} />
              <Route path="/admin/pending/:id" element={<PendingProjectPage />} />

              <Route path="/submit" element={<SubmitProjectPage />} />
              <Route path="/projetos" element={<ProjectsPortfolioPage />} />
              <Route path="/porto-de-ideias" element={<PortoDeIdeiasPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/exemplo/:exampleId" element={<ExampleProjectPage />} />
              <Route path="/dev" element={<DevMenu />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
