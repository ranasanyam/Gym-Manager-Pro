import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, User, UserPlus } from "lucide-react";

export default function TrainersPage() {
  const { data: trainers, isLoading } = useQuery({
    queryKey: ['/api/trainers'],
    queryFn: async () => {
      // Placeholder for now
      return [];
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Trainers</h2>
          <p className="text-muted-foreground mt-1">Manage your gym's professional trainers.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Add Trainer
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading trainers...</div>
      ) : trainers?.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <User className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No trainers added</h3>
            <p className="text-slate-500">Hire professionals to help your members reach their goals.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainers?.map((trainer: any) => (
            <Card key={trainer.id} className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12 border border-slate-200">
                  <AvatarFallback>{trainer.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-display text-lg">{trainer.fullName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{trainer.specialization || "General Fitness"}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  Assigned Gym: <span className="font-medium text-slate-900">Main Gym</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
