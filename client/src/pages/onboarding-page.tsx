import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Building2, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async (role: "owner" | "member") => {
      const res = await fetch(api.auth.updateRole.path, {
        method: api.auth.updateRole.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([api.auth.me.path], updatedUser);
      if (updatedUser.role === "owner") {
        setLocation("/gyms/create");
      } else {
        setLocation("/dashboard");
      }
    },
  });

  if (user?.role) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-display text-slate-900">Welcome to GymCore</h1>
          <p className="text-slate-500 mt-2 text-lg">Please select how you'll be using the platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card 
            className="group hover:border-primary transition-all duration-300 cursor-pointer border-2 shadow-xl"
            onClick={() => updateRoleMutation.mutate("owner")}
          >
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Building2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-display">I am a Gym Owner</CardTitle>
              <CardDescription className="text-base mt-2">
                Manage your gym, members, trainers, and track revenue all in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-white"
                disabled={updateRoleMutation.isPending}
              >
                Select Owner
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="group hover:border-primary transition-all duration-300 cursor-pointer border-2 shadow-xl"
            onClick={() => updateRoleMutation.mutate("member")}
          >
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <User className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-display">I am a Member</CardTitle>
              <CardDescription className="text-base mt-2">
                Find local gyms, book classes, and track your workout and diet plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-white"
                disabled={updateRoleMutation.isPending}
              >
                Select Member
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
