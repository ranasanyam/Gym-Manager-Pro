import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  Dumbbell,
  Settings,
  Menu,
  CreditCard,
  Bell,
  FileText,
  User,
  Activity,
  Apple
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  const getNavItems = () => {
    switch (user.role) {
      case "owner":
        return [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/gyms", label: "Gyms", icon: Dumbbell },
          { href: "/dashboard/members", label: "Members", icon: Users },
          { href: "/dashboard/trainers", label: "Trainers", icon: User },
          { href: "/dashboard/attendance", label: "Attendance", icon: Calendar },
          { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
          { href: "/dashboard/workouts", label: "Workout Plans", icon: Activity },
          { href: "/dashboard/diets", label: "Diet Plans", icon: Apple },
          { href: "/dashboard/reports", label: "Reports", icon: FileText },
          { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ];
      case "trainer":
        return [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/assigned-members", label: "Assigned Members", icon: Users },
          { href: "/dashboard/workouts", label: "Workout Plans", icon: Activity },
          { href: "/dashboard/diets", label: "Diet Plans", icon: Apple },
          { href: "/dashboard/profile", label: "Profile", icon: User },
        ];
      case "member":
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/workout", label: "Workout", icon: Activity },
          { href: "/dashboard/diet", label: "Diet", icon: Apple },
          { href: "/dashboard/attendance", label: "Attendance", icon: Calendar },
          { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
          { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
          { href: "/dashboard/profile", label: "Profile", icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  const Sidebar = ({ className }: { className?: string }) => (
    <div className={`flex flex-col h-full bg-slate-900 text-white ${className}`}>
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-display text-2xl font-bold text-white">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span>GymCore</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10 border border-slate-700">
            <AvatarFallback className="bg-primary text-white font-bold">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.fullName}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-40 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span>GymCore</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
