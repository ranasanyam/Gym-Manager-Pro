import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Plus, Trash, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function GymDetailsPage() {
  const { id } = useParams();

  const { data: gym, isLoading } = useQuery<any>({
    queryKey: [`/api/gyms/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch gym');
      return res.json();
    },
    enabled: !!id,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<string>('overview');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [facilitiesList, setFacilitiesList] = useState<string[]>([]);
  const [servicesList, setServicesList] = useState<Array<{ name: string; price: number }>>([]);

  useEffect(() => {
    if (tab === 'edit' && gym) {
      setPendingImages(gym.gymImages || []);
      setFacilitiesList(gym.facilities || []);
      setServicesList((gym.services || []).map((s: any) => ({ name: s.name, price: s.price || 0 })));
    }
  }, [tab, gym]);

  const { data: members } = useQuery<any[]>({
    queryKey: [`/api/gyms/${id}/members`],
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${id}/members`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: !!id,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to remove member');
      return true;
    },
    onSuccess: () => {
      toast({ title: 'Member removed' });
      queryClient.invalidateQueries({ queryKey: [`/api/gyms/${id}/members`] });
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
    }
  });

  const patchGymMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/gyms/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.message || 'Failed to update gym');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Gym updated' });
      queryClient.invalidateQueries({ queryKey: [`/api/gyms/${id}`] });
      setPendingImages([]);
      setTab('overview');
      setFacilitiesList([]);
      setServicesList([]);
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update gym', description: err?.message || String(err), variant: 'destructive' });
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



      <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="space-y-6">
        <TabsList className="bg-white p-1 border shadow-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Address:</strong> {gym.address}</p>
              <p><strong>Contact:</strong> {gym.contactNumber}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gym Members</CardTitle>
              <div className="flex items-center gap-2">
                <Link href={`/members/add?gymId=${id}`}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Member
                  </Button>
                </Link>

              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No members found.</p>
                ) : (
                  members?.map((m: any) => (
                    <div key={m.member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{m.user.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{m.user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{m.user.mobileNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>{m.member.membershipType}</Badge>
                        <button className="text-red-500 hover:text-red-700" onClick={() => {
                          if (confirm('Remove member from this gym?')) deleteMemberMutation.mutate(m.member.id);
                        }}>
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gym Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gym.facilities?.map((f: string) => (
                  <div key={f} className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50/50">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium capitalize">{f.replace('_', ' ')}</span>
                  </div>
                ))}
                {!gym.facilities?.length && <p className="text-muted-foreground text-sm col-span-full text-center py-8">No facilities listed</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gym Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gym.services?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 col-span-full">No services offered.</p>
                ) : (
                  gym.services?.map((s: any, idx: number) => (
                    <Card key={idx} className="bg-slate-50/50 border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">{s.name}</CardTitle>
                        <div className="text-primary font-bold">₹{s.price}</div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{s.description || "No description available."}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Gym</CardTitle>
              <div className="text-sm text-muted-foreground">Update images, facilities and services.</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium mb-2">Images</div>
                  <div className="flex gap-3 items-start">
                    {(pendingImages.length ? pendingImages : (gym.gymImages || [])).map((u: string, idx: number) => (
                      <div key={idx} className="relative">
                        <img src={u} alt={`img-${idx}`} className="h-28 w-36 object-cover rounded-md" />
                        <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1 shadow" onClick={() => setPendingImages(prev => prev.filter((_,i) => i !== idx))}>✕</button>
                      </div>
                    ))}
                    <div className="flex flex-col items-start">
                      <input type="file" accept="image/*" multiple onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const fd = new FormData();
                        for (let i = 0; i < files.length; i++) fd.append('images', files[i]);
                        const res = await fetch('/api/uploads', { method: 'POST', body: fd, credentials: 'include' });
                        if (!res.ok) return toast({ title: 'Failed to upload images', variant: 'destructive' });
                        const body = await res.json();
                        setPendingImages(prev => [...prev, ...(body.urls || [])]);
                      }} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Facilities</div>
                  <div className="flex gap-2 flex-wrap items-center">
                    {facilitiesList.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded">
                        <span className="text-sm">{f}</span>
                        <button className="text-red-500" onClick={() => setFacilitiesList(prev => prev.filter((_,j) => j !== i))}>✕</button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input id="facInput" className="p-1 border rounded" placeholder="Add facility" />
                      <Button size="sm" onClick={() => { const v = (document.getElementById('facInput') as HTMLInputElement).value.trim(); if (v) { setFacilitiesList(prev => [...prev, v]); (document.getElementById('facInput') as HTMLInputElement).value = ''; } }}>Add</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Services</div>
                  <div className="space-y-2">
                    {servicesList.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={s.name} onChange={e => { const name = e.target.value; setServicesList(prev => { const copy = [...prev]; copy[i] = { ...copy[i], name }; return copy; }); }} className="p-1 border rounded" />
                        <input value={String(s.price)} onChange={e => { const price = Number(e.target.value); setServicesList(prev => { const copy = [...prev]; copy[i] = { ...copy[i], price: isNaN(price) ? 0 : price }; return copy; }); }} className="p-1 border rounded w-24" />
                        <Button size="sm" variant="outline" onClick={() => setServicesList(prev => prev.filter((_,j) => j !== i))}>Remove</Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input id="newServiceName" placeholder="Service name" className="p-1 border rounded" />
                      <input id="newServicePrice" placeholder="Price" className="p-1 border rounded w-24" />
                      <Button size="sm" onClick={() => { const name = (document.getElementById('newServiceName') as HTMLInputElement).value.trim(); const price = Number((document.getElementById('newServicePrice') as HTMLInputElement).value); if (!name || Number.isNaN(price)) return toast({ title: 'Invalid service', variant: 'destructive' }); setServicesList(prev => [...prev, { name, price }]); (document.getElementById('newServiceName') as HTMLInputElement).value = ''; (document.getElementById('newServicePrice') as HTMLInputElement).value = ''; }}>Add Service</Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => {
                    const payload: any = { gymImages: pendingImages.length ? pendingImages : (gym.gymImages || []), facilities: facilitiesList, services: servicesList };
                    patchGymMutation.mutate(payload);
                  }}>Save Changes</Button>
                  <Button variant="outline" onClick={() => { setPendingImages([]); setTab('overview'); setFacilitiesList([]); setServicesList([]); }}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
