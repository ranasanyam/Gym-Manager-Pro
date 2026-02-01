import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Loader2 } from "lucide-react";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const canCreate = user?.role === 'owner' || user?.role === 'trainer';

  const { data: member } = useQuery({
    queryKey: ['/api/member/me'],
    queryFn: async () => {
      const res = await fetch('/api/user/member');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: user?.role === 'member'
  });

  const { data: plans, isLoading } = useQuery<any[]>({
    queryKey: member ? [buildUrl(api.plans.workouts.list.path, { memberId: member.id })] : ['/api/workouts'],
    queryFn: async () => {
      const res = await fetch(member ? buildUrl(api.plans.workouts.list.path, { memberId: member.id }) : '/api/workouts');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!member || user?.role !== 'member',
  });

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Workout Plans</h2>
          <p className="text-muted-foreground mt-1">Weekly training schedules and exercise guides.</p>
        </div>
        {canCreate && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-10">Loading plans...</div>
        ) : plans?.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-slate-50 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Activity className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No workout plans yet</h3>
              <p className="text-slate-500">
                {canCreate ? "Create a workout plan for your members." : "Your trainer hasn't assigned a plan yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {weekDays.map(day => (
              <Card key={day} className="border-none shadow-sm">
                <CardHeader className="bg-slate-50/50 py-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">{day}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400 italic">No exercises scheduled for this day.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
