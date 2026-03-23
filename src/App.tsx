import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SyncPlantLayout from "@/components/syncplant/SyncPlantLayout";
import DashboardPage from "@/pages/DashboardPage";
import MonitoringPage from "@/pages/MonitoringPage";
import LogsPage from "@/pages/LogsPage";
import SchedulePage from "@/pages/SchedulePage";
import HeatmapPage from "@/pages/HeatmapPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AlertsPage from "@/pages/AlertsPage";
import AIPage from "@/pages/AIPage";
import UploadPage from "@/pages/UploadPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<SyncPlantLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
