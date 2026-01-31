import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function MembersPage() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    }
  });

  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredMembers = Array.isArray(members) ? members.filter((m: any) => 
    m.user?.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    m.user?.mobileNumber?.includes(search)
  ) : [];

  const addMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to add member");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Member added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      setOpen(false);
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Members</h2>
          <p className="text-muted-foreground mt-1">Manage memberships and gym access.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Button className="gap-2" onClick={() => setLocation('/members/create')}>
              <UserPlus className="h-4 w-4" /> Add Member
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10">Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-slate-50 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No members found</h3>
              <p className="text-slate-500">Start by adding your first gym member.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 font-medium text-sm text-slate-500">
              <div className="col-span-4 pl-2">Member</div>
              <div className="col-span-3">Mobile</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3 text-right pr-2">Status</div>
            </div>
            {filteredMembers.map((m: any) => (
              <div key={m.member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {m.user?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-900">{m.user?.fullName}</span>
                </div>
                <div className="col-span-3 text-sm text-slate-500">{m.user?.mobileNumber}</div>
                <div className="col-span-2">
                  <Badge variant="outline">{m.member.membershipType}</Badge>
                </div>
                <div className="col-span-3 text-right pr-2">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
