import { useStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, Calendar } from "lucide-react";
import { StatCard } from "@/components/stat-card";

export default function ReportsPage() {
  const { data: stats } = useStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Analytics Reports</h2>
        <p className="text-muted-foreground mt-1">Detailed business performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Revenue Growth"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={TrendingUp}
          description="Monthly comparison"
          trend="+5%"
        />
        <StatCard
          title="Active Members"
          value={stats?.activeMembers || 0}
          icon={Users}
          description="Members with active plans"
        />
        <StatCard
          title="Avg. Attendance"
          value="85%"
          icon={Calendar}
          description="Check-ins this month"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-display">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400">
            Revenue Chart Placeholder
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-display">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400">
            Attendance Chart Placeholder
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
