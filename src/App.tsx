import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DevMenu from "./pages/DevMenu";
import ProjectFullView from "./pages/ProjectFullView";
import SubmitProjectPage from "./pages/SubmitProjectPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProjectPage from "./pages/CreateProjectPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DevMenu />} />
          <Route path="/index" element={<Index />} />
          <Route path="/project-full/:id" element={<ProjectFullView />} />
          <Route path="/submit-project" element={<SubmitProjectPage />} />
          <Route path="/admin-090835" element={<AdminDashboard />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
