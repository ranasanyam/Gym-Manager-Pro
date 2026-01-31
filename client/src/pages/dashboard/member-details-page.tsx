import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { api, buildUrl } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Calendar, CreditCard, Activity, Utensils, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: [buildUrl(api.members.list.path + "/:id", { id: id! })],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Member not found</h2>
        <Link href="/members">
          <Button className="mt-4">Back to Members</Button>
        </Link>
      </div>
    );
  }

  const { user, member: memberDetails, attendance = [], payments = [], workoutPlans = [], dietPlans = [] } = member;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://avatar.vercel.sh/${user.username}`} />
            <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <p className="text-muted-foreground">{user.mobileNumber}</p>
          </div>
          <Badge variant={memberDetails.membershipType === "PAID" ? "default" : "secondary"}>
            {memberDetails.membershipType} Member
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Expires on {format(new Date(memberDetails.endDate), "PPP")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Attendance (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendance.length} Sessions</div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {memberDetails.goals?.map((goal: string) => (
                    <Badge key={goal} variant="outline">{goal.replace('_', ' ')}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="capitalize">{memberDetails.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>{memberDetails.ageOrDob ? format(new Date(memberDetails.ageOrDob), "PPP") : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{memberDetails.address || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records found.</p>
              ) : (
                <div className="space-y-4">
                  {attendance.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(record.date), "PPP")}</span>
                      </div>
                      <Badge variant="outline">{record.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No payment records found.</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">₹{payment.amount}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(payment.paymentDate), "PPP")}</p>
                        </div>
                      </div>
                      <Badge className={payment.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Workout Plans
                </CardTitle>
                <Button size="sm">Add New</Button>
              </CardHeader>
              <CardContent>
                {workoutPlans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No workout plans assigned.</p>
                ) : (
                  <div className="space-y-3">
                    {workoutPlans.map((plan: any) => (
                      <div key={plan.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  Diet Plans
                </CardTitle>
                <Button size="sm">Add New</Button>
              </CardHeader>
              <CardContent>
                {dietPlans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No diet plans assigned.</p>
                ) : (
                  <div className="space-y-3">
                    {dietPlans.map((plan: any) => (
                      <div key={plan.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
