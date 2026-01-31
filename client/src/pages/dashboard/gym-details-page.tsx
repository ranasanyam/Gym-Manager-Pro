import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GymDetailsPage() {
  const [match, params] = useRoute("/gyms/:id");
  const gymId = params?.id ? Number(params.id) : NaN;

  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: [`/api/gyms/${gymId}`],
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${gymId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch gym');
      return res.json();
    },
    enabled: !Number.isNaN(gymId),
  });

  const { data: members } = useQuery({
    queryKey: [`/api/gyms/${gymId}/members`],
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${gymId}/members`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: !Number.isNaN(gymId),
  });

  if (gymLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">{gym?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {gym?.gymImages && gym.gymImages.length > 0 ? (
                  <div className="space-y-2">
                    <img src={gym.gymImages[0]} alt={gym?.name} className="w-full h-64 object-cover rounded" />
                    <div className="flex gap-2 mt-2">
                      {gym.gymImages.map((url: string, i: number) => (
                        <img key={url} src={url} className="w-20 h-12 object-cover rounded" alt={`thumb-${i}`} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 w-full bg-slate-100 flex items-center justify-center text-slate-500">No images</div>
                )}
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <div><strong>Address:</strong> {gym?.address}, {gym?.city}</div>
                <div><strong>Contact:</strong> {gym?.contactNumber}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <ul className="space-y-2">
                  {members.map((m: any) => (
                    <li key={m.member.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{m.user.mobileNumber}</div>
                      </div>
                      <div className="text-sm text-slate-600">{m.member.membershipType}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">No members yet.</div>
              )}

              <div className="mt-4">
                <Button variant="outline">Invite Member</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}