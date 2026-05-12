import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import LiveHearing from '@/pages/LiveHearing';
import LegalAssistant from "./pages/LegalAssistant";
import Login from "./pages/Login";
import SignupCitizen from "./pages/auth/SignupCitizen";
import SignupLawyer from "./pages/auth/SignupLawyer";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import FileCase from "./pages/citizen/FileCase";
import MyCases from "./pages/citizen/MyCases";
import CaseDetail from "./pages/citizen/CaseDetail";
import CitizenVault from "./pages/citizen/CitizenVault";
import CitizenSettings from "./pages/citizen/CitizenSettings";
import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import CaseDiscovery from "./pages/lawyer/CaseDiscovery";
import LawyerMyCases from "./pages/lawyer/LawyerMyCases";
import LawyerCaseDetail from "./pages/lawyer/LawyerCaseDetail";
import LawyerFileCase from "./pages/lawyer/LawyerFileCase";
import LawyerSettings from "./pages/lawyer/LawyerSettings";
import JudgeDashboard from "./pages/judge/JudgeDashboard";
import JudgeCaseReview from "./pages/judge/JudgeCaseReview";
import JudgeHearings from "./pages/judge/JudgeHearings";
import JudgeVerdict from "./pages/judge/JudgeVerdict";
import JudgeCaseDetail from "./pages/judge/JudgeCaseDetail";
import JudgeSettings from "./pages/judge/JudgeSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

import LegalAwareness from "./pages/LegalAwareness";
import Transparency from "./pages/Transparency";

import ProcessGuide from "./pages/ProcessGuide";
import HelpDesk from "./pages/HelpDesk";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/legal-assistant" element={<LegalAssistant />} />
            <Route path="/legal-awareness" element={<LegalAwareness />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/citizen" element={<SignupCitizen />} />
            <Route path="/signup/lawyer" element={<SignupLawyer />} />
            <Route path="/hearing/:id" element={<LiveHearing />} />
            {/* Citizen Routes */}
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/file-case" element={<FileCase />} />
            <Route path="/citizen/my-cases" element={<MyCases />} />
            <Route path="/citizen/case/:id" element={<CaseDetail />} />
            <Route path="/citizen/vault" element={<CitizenVault />} />
            <Route path="/citizen/settings" element={<CitizenSettings />} />
            {/* Lawyer Routes */}
            <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/case-discovery" element={<CaseDiscovery />} />
            <Route path="/lawyer/my-cases" element={<LawyerMyCases />} />
            <Route path="/lawyer/case/:id" element={<LawyerCaseDetail />} />
            <Route path="/lawyer/file-case" element={<LawyerFileCase />} />
            <Route path="/lawyer/settings" element={<LawyerSettings />} />
            {/* Judge Routes */}
            <Route path="/judge/dashboard" element={<JudgeDashboard />} />
            <Route path="/judge/case-review" element={<JudgeCaseReview />} />
            <Route path="/judge/hearings" element={<JudgeHearings />} />
            <Route path="/judge/verdict" element={<JudgeVerdict />} />
            <Route path="/judge/case/:id" element={<JudgeCaseDetail />} />
            <Route path="/judge/settings" element={<JudgeSettings />} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/verification" element={<AdminDashboard />} />
            <Route path="/admin/logs" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
