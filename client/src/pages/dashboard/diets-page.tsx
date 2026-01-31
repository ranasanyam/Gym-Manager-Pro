import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Apple, Utensils } from "lucide-react";
import { api, buildUrl } from "@shared/routes";

export default function DietsPage() {
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

  const { data: plans, isLoading } = useQuery({
    queryKey: member ? [buildUrl(api.plans.diets.list.path, { memberId: member.id })] : ['/api/diets'],
    enabled: !!member || user?.role !== 'member',
  });

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Diet Plans</h2>
          <p className="text-muted-foreground mt-1">Weekly meal schedules and nutrition guides.</p>
        </div>
        {canCreate && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Diet Plan
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-10">Loading plans...</div>
        ) : plans?.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-slate-50 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Apple className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No diet plans yet</h3>
              <p className="text-slate-500">
                {canCreate ? "Create a nutrition plan for your members." : "Your trainer hasn't assigned a plan yet."}
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
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400">Breakfast</p>
                      <p className="text-sm">-</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400">Lunch</p>
                      <p className="text-sm">-</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400">Snacks</p>
                      <p className="text-sm">-</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400">Dinner</p>
                      <p className="text-sm">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
