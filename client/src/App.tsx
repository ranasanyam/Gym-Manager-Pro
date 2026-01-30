import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import CreateGymPage from "@/pages/dashboard/create-gym-page";
import NotFound from "@/pages/not-found";
import OwnerDashboard from "@/pages/dashboard/owner-dashboard";
import ClassesPage from "@/pages/dashboard/classes-page";
import UsersPage from "@/pages/dashboard/users-page";
import SchedulePage from "@/pages/dashboard/schedule-page";
import MemberDashboard from "@/pages/dashboard/member-dashboard";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Dumbbell className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold font-display">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        This feature is currently under development. Stay tuned for updates!
      </p>
    </div>
  );
}

function ProtectedRoute({ 
  component: Component, 
  allowedRoles = [] 
}: { 
  component: React.ComponentType, 
  allowedRoles?: string[] 
}) {
  const { user, isLoading } = useAuth();
  const { data: gym } = useQuery({
    queryKey: ['/api/gyms/owner'],
    enabled: user?.role === 'owner',
    queryFn: async () => {
      const res = await fetch('/api/gyms/owner');
      if (!res.ok) return [];
      return res.json();
    }
  });

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

  // Owner must create a gym first
  if (user.role === 'owner' && (!gym || gym.length === 0) && window.location.pathname !== '/dashboard/gyms/create') {
     return <Redirect to="/dashboard/gyms/create" />;
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
            <Route path="/dashboard/gyms/create">
              <ProtectedRoute component={CreateGymPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/schedule">
              <ProtectedRoute component={SchedulePage} />
            </Route>
            
            {/* Placeholder routes for missing pages */}
            <Route path="/dashboard/gyms">
              <ProtectedRoute component={() => <PlaceholderPage title="Gym Management" />} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/trainers">
              <ProtectedRoute component={() => <PlaceholderPage title="Trainer Management" />} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/attendance">
              <ProtectedRoute component={() => <PlaceholderPage title="Attendance Tracking" />} />
            </Route>
            <Route path="/dashboard/payments">
              <ProtectedRoute component={() => <PlaceholderPage title="Payment History" />} />
            </Route>
            <Route path="/dashboard/workouts">
              <ProtectedRoute component={() => <PlaceholderPage title="Workout Plans" />} />
            </Route>
            <Route path="/dashboard/diets">
              <ProtectedRoute component={() => <PlaceholderPage title="Diet Plans" />} />
            </Route>
            <Route path="/dashboard/reports">
              <ProtectedRoute component={() => <PlaceholderPage title="Analytics Reports" />} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/settings">
              <ProtectedRoute component={() => <PlaceholderPage title="Account Settings" />} />
            </Route>
            <Route path="/dashboard/workout">
              <ProtectedRoute component={() => <PlaceholderPage title="My Workout Plan" />} allowedRoles={['member']} />
            </Route>
            <Route path="/dashboard/diet">
              <ProtectedRoute component={() => <PlaceholderPage title="My Diet Plan" />} allowedRoles={['member']} />
            </Route>
            <Route path="/dashboard/notifications">
              <ProtectedRoute component={() => <PlaceholderPage title="Notifications" />} />
            </Route>
            <Route path="/dashboard/profile">
              <ProtectedRoute component={() => <PlaceholderPage title="My Profile" />} />
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
