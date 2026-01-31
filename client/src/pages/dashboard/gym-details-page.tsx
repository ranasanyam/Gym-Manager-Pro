import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GymDetailsPage() {
  const { id } = useParams();

  const { data: gym, isLoading } = useQuery({
    queryKey: [`/api/gyms/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${id}`);
      if (!res.ok) throw new Error("Failed to fetch gym details");
      return res.json();
    }
  });

  const { data: members } = useQuery({
    queryKey: [`/api/gyms/${id}/members`],
    enabled: !!gym,
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${id}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!gym) return <div>Gym not found</div>;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
        {gym.gymImages?.[0] ? (
          <img src={gym.gymImages[0]} className="w-full h-full object-cover" alt={gym.name} />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-end p-8">
          <div className="text-white">
            <h1 className="text-4xl font-bold font-display">{gym.name}</h1>
            <div className="flex gap-4 mt-2 text-slate-100">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {gym.city}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {gym.contactNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white p-1 border shadow-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gym.services?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {gym.facilities?.map((f: string) => (
                    <Badge key={f} variant="secondary" className="px-3 py-1">{f}</Badge>
                  ))}
                  {!gym.facilities?.length && <p className="text-muted-foreground text-sm">No facilities listed</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Address:</strong> {gym.address}</p>
                <p><strong>Contact:</strong> {gym.contactNumber}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gym Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members?.map((m: any) => (
                  <div key={m.member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{m.user.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{m.user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{m.user.mobileNumber}</p>
                      </div>
                    </div>
                    <Badge>{m.member.membershipType}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gym.services?.map((s: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">₹{s.price}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t">
              Revenue charts and detailed payment history will appear here.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
