import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-display">Profile Information</CardTitle>
            <CardDescription>Update your personal details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-slate-100">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{user?.fullName}</h3>
                <p className="text-sm text-slate-500 capitalize">{user?.role} Account</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Mobile Number</p>
                <p className="font-medium">{user?.mobileNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                <p className="font-medium">{user?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">City</p>
                <p className="font-medium">{user?.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md opacity-60">
          <CardHeader className="flex flex-row items-center gap-3">
            <Shield className="h-5 w-5 text-slate-400" />
            <div>
              <CardTitle className="text-lg">Security & Privacy</CardTitle>
              <CardDescription>Coming soon: Change password and two-factor authentication.</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md opacity-60">
          <CardHeader className="flex flex-row items-center gap-3">
            <Bell className="h-5 w-5 text-slate-400" />
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Coming soon: Configure email and SMS alerts.</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <div className="pt-4">
          <Button 
            variant="destructive" 
            className="w-full md:w-auto gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            Sign Out of GymCore
          </Button>
        </div>
      </div>
    </div>
  );
}
