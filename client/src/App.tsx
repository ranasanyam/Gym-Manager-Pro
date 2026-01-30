import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2, Dumbbell } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import CreateGymPage from "@/pages/dashboard/create-gym-page";
import NotFound from "@/pages/not-found";
import OwnerDashboard from "@/pages/dashboard/owner-dashboard";
import ClassesPage from "@/pages/dashboard/classes-page";
import UsersPage from "@/pages/dashboard/users-page";
import GymsPage from "@/pages/dashboard/gyms-page";
import MembersPage from "@/pages/dashboard/members-page";
import TrainersPage from "@/pages/dashboard/trainers-page";
import AttendancePage from "@/pages/dashboard/attendance-page";
import PaymentsPage from "@/pages/dashboard/payments-page";
import WorkoutsPage from "@/pages/dashboard/workouts-page";
import DietsPage from "@/pages/dashboard/diets-page";
import ReportsPage from "@/pages/dashboard/reports-page";
import SettingsPage from "@/pages/dashboard/settings-page";
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
            
            <Route path="/dashboard/gyms">
              <ProtectedRoute component={GymsPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/members">
              <ProtectedRoute component={MembersPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/trainers">
              <ProtectedRoute component={TrainersPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/attendance">
              <ProtectedRoute component={AttendancePage} />
            </Route>
            <Route path="/dashboard/payments">
              <ProtectedRoute component={PaymentsPage} />
            </Route>
            <Route path="/dashboard/workouts">
              <ProtectedRoute component={WorkoutsPage} />
            </Route>
            <Route path="/dashboard/diets">
              <ProtectedRoute component={DietsPage} />
            </Route>
            <Route path="/dashboard/reports">
              <ProtectedRoute component={ReportsPage} allowedRoles={['owner']} />
            </Route>
            <Route path="/dashboard/settings">
              <ProtectedRoute component={SettingsPage} />
            </Route>
            <Route path="/dashboard/workout">
              <ProtectedRoute component={WorkoutsPage} allowedRoles={['member']} />
            </Route>
            <Route path="/dashboard/diet">
              <ProtectedRoute component={DietsPage} allowedRoles={['member']} />
            </Route>
            <Route path="/dashboard/notifications">
              <ProtectedRoute component={() => <PlaceholderPage title="Notifications" />} />
            </Route>
            <Route path="/dashboard/profile">
              <ProtectedRoute component={SettingsPage} />
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
