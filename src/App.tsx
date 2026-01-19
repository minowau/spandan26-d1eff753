import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import TeamSports from "./pages/TeamSports";
import IndividualSports from "./pages/IndividualSports";
import MinorSports from "./pages/MinorSports";
import SportDetail from "./pages/SportDetail";
import Schedule from "./pages/Schedule";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/team-sports" element={<TeamSports />} />
              <Route path="/team-sports/:sportId" element={<SportDetail />} />
              <Route path="/individual-sports" element={<IndividualSports />} />
              <Route path="/individual-sports/:sportId" element={<SportDetail />} />
              <Route path="/minor-sports" element={<MinorSports />} />
              <Route path="/minor-sports/:sportId" element={<SportDetail />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
