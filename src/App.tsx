import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProjectPage from "./pages/AdminAddProjectPage";
import SubmitProjectPage from "./pages/SubmitProjectPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectsPortfolioPage from "./pages/ProjectsPortfolioPage";
import PortoDeIdeiasPage from "./pages/PortoDeIdeiasPage";
import ExampleProjectPage from "./pages/ExampleProjectPage";
import PendingProjectPage from "./pages/PendingProjectPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-project" element={<AdminAddProjectPage />} />
            <Route path="/admin/pending/:id" element={<PendingProjectPage />} />
            <Route path="/submit" element={<SubmitProjectPage />} />
            <Route path="/projetos" element={<ProjectsPortfolioPage />} />
            <Route path="/porto-de-ideias" element={<PortoDeIdeiasPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/exemplo/:exampleId" element={<ExampleProjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;