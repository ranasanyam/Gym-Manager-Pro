import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import NotFound from "@/pages/not-found";
import OwnerDashboard from "@/pages/dashboard/owner-dashboard";
import ClassesPage from "@/pages/dashboard/classes-page";
import UsersPage from "@/pages/dashboard/users-page";
import SchedulePage from "@/pages/dashboard/schedule-page";
import MemberDashboard from "@/pages/dashboard/member-dashboard";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles = [] 
}: { 
  component: React.ComponentType, 
  allowedRoles?: string[] 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!user.role) {
    return <Redirect to="/onboarding" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function DashboardHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Redirect to="/auth" />;
  if (!user.role) return <Redirect to="/onboarding" />;

  switch (user.role) {
    case "owner":
      return <OwnerDashboard />;
    case "trainer":
      return <Redirect to="/dashboard/schedule" />;
    case "member":
    default:
      return <MemberDashboard />;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      
      <Route path="/">
        {() => <Redirect to="/dashboard" />}
      </Route>

      <Route path="/dashboard*">
        <LayoutShell>
          <Switch>
            <Route path="/dashboard" component={DashboardHome} />
            <Route path="/dashboard/classes">
              <ProtectedRoute component={ClassesPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/users">
              <ProtectedRoute component={UsersPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/schedule">
              <ProtectedRoute component={SchedulePage} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </LayoutShell>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
