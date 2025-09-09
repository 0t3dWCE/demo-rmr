import "./global.css";
import "./utils/resizeObserverErrorHandler";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "./contexts/RoleContext";
import { ProjectStoreProvider } from "./contexts/ProjectStoreContext";

// Pages
import NotFound from "./pages/NotFound";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import TechCom from "./pages/TechCom";
import TechComDetail from "./pages/TechComDetail";
import ArchitectActivity from "./pages/ArchitectActivity";
import ArchitectReviewDetail from "./pages/ArchitectReviewDetail";
import PlaceholderPage from "./components/PlaceholderPage";
import TaskEstimates from "./pages/TaskEstimates";
import DirectorApprove from "./pages/DirectorApprove";

// Icons for placeholder pages
import { 
  Building2, 
  Users, 
  BarChart, 
  Settings, 
  List, 
  FileText, 
  Monitor 
} from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/demo-rmr">
      <TooltipProvider>
        <RoleProvider>
          <ProjectStoreProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/techcom" element={<TechCom />} />
              <Route path="/techcom/:id" element={<TechComDetail />} />
              <Route path="/architect-activity" element={<ArchitectActivity />} />
              <Route path="/architect-activity/:projectId" element={<ArchitectReviewDetail />} />
              <Route path="/estimates" element={<TaskEstimates />} />
              <Route path="/director" element={<DirectorApprove />} />
              <Route 
                path="/settings" 
                element={
                  <PlaceholderPage 
                    title="Настройки системы"
                    description="Конфигурация системы и управление параметрами"
                    icon={<Settings className="w-12 h-12 text-gray-300" />}
                  />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProjectStoreProvider>
        </RoleProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
