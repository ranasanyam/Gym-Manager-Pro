import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

export default function GymsPage() {
  const { data: gyms, isLoading } = useQuery({
    queryKey: ['/api/gyms/owner'],
    queryFn: async () => {
      const res = await fetch('/api/gyms/owner', { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch gyms");
      return res.json();
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">My Gyms</h2>
          <p className="text-muted-foreground mt-1">Manage your fitness center locations.</p>
        </div>
        <Link href="/gyms/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add New Gym
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />)}
        </div>
      ) : gyms?.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Dumbbell className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No gyms created yet</h3>
            <p className="text-slate-500 mb-6">Add your first gym to get started.</p>
            <Link href="/gyms/create">
              <Button variant="outline">Create Gym</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gyms?.map((gym: any) => (
            <Link key={gym.id} href={`/gyms/${gym.id}`}>
              <a className="block no-underline">
                <Card className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {gym.gymImages && gym.gymImages.length > 0 ? (
                    <div className="h-40 w-full overflow-hidden bg-slate-100">
                      <img src={gym.gymImages[0]} alt={gym.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-slate-400">No image</div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-display text-xl">{gym.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{gym.address}, {gym.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{gym.contactNumber}</span>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
