import { Switch, Route, Redirect, useLocation } from "wouter";
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
import GymDetailsPage from "@/pages/dashboard/gym-details-page";
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
import AddMemberPage from "@/pages/dashboard/add-member-page";

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
  const { data: gym, isLoading: isGymLoading, isError: isGymError } = useQuery({
    queryKey: ['/api/gyms/owner'],
    enabled: user?.role === 'owner',
    queryFn: async () => {
      const res = await fetch('/api/gyms/owner', { credentials: 'include' });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(body || 'Failed to fetch gyms');
      }
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

  const [location] = useLocation();
  const currentPath = location;

  // Owner must create a gym first - only redirect when they're visiting the dashboard home
  // and the gyms query succeeded and returned empty
  if (
    user.role === 'owner' &&
    !isGymLoading &&
    !isGymError &&
    (!gym || gym.length === 0) &&
    currentPath !== '/gyms/create' &&
    (currentPath === '/dashboard' || currentPath === '/')
  ) {
    // dev log removed
    return <Redirect to="/gyms/create" />;
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

function DashboardRoutes() {
  const [location] = useLocation();

  return (
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
  );
}

function Router() {
  const [location] = useLocation();

  // router location is tracked by Wouter's hooks when needed in future

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      
      <Route path="/">
        {() => <Redirect to="/dashboard" />}
      </Route>

      {/* Top-level routes for primary pages (rendered inside the LayoutShell) */}

      <Route path="/gyms">
        <LayoutShell>
          <ProtectedRoute component={GymsPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/gyms/create">
        <LayoutShell>
          <ProtectedRoute component={CreateGymPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/gyms/:id">
        <LayoutShell>
          <ProtectedRoute component={GymDetailsPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/members">
        <LayoutShell>
          <ProtectedRoute component={MembersPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/members/create">
        <LayoutShell>
          <ProtectedRoute component={AddMemberPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/trainers">
        <LayoutShell>
          <ProtectedRoute component={TrainersPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/attendance">
        <LayoutShell>
          <ProtectedRoute component={AttendancePage} />
        </LayoutShell>
      </Route>

      <Route path="/payments">
        <LayoutShell>
          <ProtectedRoute component={PaymentsPage} />
        </LayoutShell>
      </Route>

      <Route path="/workouts">
        <LayoutShell>
          <ProtectedRoute component={WorkoutsPage} />
        </LayoutShell>
      </Route>

      <Route path="/diets">
        <LayoutShell>
          <ProtectedRoute component={DietsPage} />
        </LayoutShell>
      </Route>

      <Route path="/reports">
        <LayoutShell>
          <ProtectedRoute component={ReportsPage} allowedRoles={["owner"]} />
        </LayoutShell>
      </Route>

      <Route path="/settings">
        <LayoutShell>
          <ProtectedRoute component={SettingsPage} />
        </LayoutShell>
      </Route>

      <Route path="/schedule">
        <LayoutShell>
          <ProtectedRoute component={SchedulePage} />
        </LayoutShell>
      </Route>

      <Route path="/workout">
        <LayoutShell>
          <ProtectedRoute component={WorkoutsPage} allowedRoles={["member"]} />
        </LayoutShell>
      </Route>

      <Route path="/diet">
        <LayoutShell>
          <ProtectedRoute component={DietsPage} allowedRoles={["member"]} />
        </LayoutShell>
      </Route>

      <Route path="/notifications">
        <LayoutShell>
          <ProtectedRoute component={() => <PlaceholderPage title="Notifications" />} />
        </LayoutShell>
      </Route>

      <Route path="/profile">
        <LayoutShell>
          <ProtectedRoute component={SettingsPage} />
        </LayoutShell>
      </Route>

      {/* Keep dashboard routes for the dashboard home */}
      <Route path="/dashboard" component={DashboardRoutes} />

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
