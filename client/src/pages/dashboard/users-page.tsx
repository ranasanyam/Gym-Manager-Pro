import { useUsersList } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function UsersPage() {
  const { data: users, isLoading } = useUsersList();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(user => 
    user.fullName.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Member Directory</h2>
          <p className="text-muted-foreground mt-1">View and manage all registered users.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No users found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 font-medium text-sm text-slate-500">
              <div className="col-span-4 pl-2">Member</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-3 text-right pr-2">Joined</div>
            </div>
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-900">{user.fullName}</span>
                </div>
                <div className="col-span-3 text-sm text-slate-500 truncate">{user.email || "No email"}</div>
                <div className="col-span-2">
                  <Badge variant={user.role === 'owner' ? "destructive" : user.role === 'trainer' ? "secondary" : "outline"} className="capitalize">
                    {user.role}
                  </Badge>
                </div>
                <div className="col-span-3 text-right text-sm text-slate-500 pr-2">
                  {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
