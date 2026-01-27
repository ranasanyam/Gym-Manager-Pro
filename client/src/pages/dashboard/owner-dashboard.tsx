import { useStats, useUsersList } from "@/hooks/use-dashboard";
import { useClasses } from "@/hooks/use-classes";
import { StatCard } from "@/components/stat-card";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Activity, 
  UserPlus 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function OwnerDashboard() {
  const { data: stats } = useStats();
  const { data: users } = useUsersList();
  
  // Get recent users (last 5)
  const recentUsers = users?.slice(-5).reverse() || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome back, here's what's happening at your gym today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon={Users}
          description="Active memberships"
          trend="+12%"
        />
        <StatCard
          title="Active Classes"
          value={stats?.activeClasses || 0}
          icon={Calendar}
          description="Scheduled this week"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Activity}
          description="Class attendance"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats?.revenue?.toLocaleString() || 0}`}
          icon={CreditCard}
          description="Projected earnings"
          trend="+8%"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        <Card className="col-span-4 shadow-md border-none">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder chart area - typically would use Recharts here */}
            <div className="h-[300px] w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
              Activity Chart Placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-md border-none">
          <CardHeader>
            <CardTitle className="font-display">New Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No members yet.</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <Avatar className="h-9 w-9 border border-slate-200">
                      <AvatarFallback className="text-xs">{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email || user.username}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {user.createdAt ? format(new Date(user.createdAt), "MMM d") : "N/A"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
