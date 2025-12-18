import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import ProfileEmployee  from "@/pages/employee/profileEmployee";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CitizenServices from "./pages/admin/CitizenServices";
import Permits from "./pages/admin/Permits";
import Finance from "./pages/admin/Finance";
import Projects from "./pages/admin/Projects";
import HumanResources from "./pages/admin/HumanResources";
import Events from "./pages/admin/Events";
import Reports from "./pages/admin/Reports";
import MyRequests from "./pages/citizen/MyRequests";
import MyPermits from "./pages/citizen/MyPermits";
import MyPayments from "./pages/citizen/MyPayments";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import CitizenEvents from "./pages/citizen/Events";
import EmployeeEvents from "./pages/employee/Events";
import {CitizenList} from "./pages/admin/citizenView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route path="/admin/citizen-services" element={<ProtectedRoute allowedRoles={['admin', 'clerk']}><DashboardLayout><CitizenServices /></DashboardLayout></ProtectedRoute>} />
             <Route path="/admin/citizen-view" element={<ProtectedRoute allowedRoles={['admin', 'clerk']}><DashboardLayout><CitizenList /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/permits" element={<ProtectedRoute allowedRoles={['admin', 'clerk']}><DashboardLayout><Permits /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><DashboardLayout><Finance /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin', 'project_manager']}><DashboardLayout><Projects /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/hr" element={<ProtectedRoute allowedRoles={['admin', 'hr_manager']}><DashboardLayout><HumanResources /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><Events /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin', 'finance', 'project_manager', 'hr_manager']}><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
            
            {/* Citizen Routes */}
            <Route path="/citizen/requests" element={<ProtectedRoute allowedRoles={['citizen']}><DashboardLayout><MyRequests /></DashboardLayout></ProtectedRoute>} />
            <Route path="/citizen/permits" element={<ProtectedRoute allowedRoles={['citizen']}><DashboardLayout><MyPermits /></DashboardLayout></ProtectedRoute>} />
            <Route path="/citizen/payments" element={<ProtectedRoute allowedRoles={['citizen']}><DashboardLayout><MyPayments /></DashboardLayout></ProtectedRoute>} />
            <Route path="/citizen/events" element={<ProtectedRoute allowedRoles={['citizen']}><DashboardLayout><CitizenEvents /></DashboardLayout></ProtectedRoute>} />
            
            {/* Employee Events Route */}
            <Route path="/employee/events" element={<ProtectedRoute allowedRoles={['finance', 'project_manager', 'hr_manager', 'clerk']}><DashboardLayout><EmployeeEvents /></DashboardLayout></ProtectedRoute>} />
            
            {/* Shared Routes */}
            <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profileEmployee" element={<ProtectedRoute><DashboardLayout><ProfileEmployee/></DashboardLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
