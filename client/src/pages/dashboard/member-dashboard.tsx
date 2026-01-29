import { useBookings, useCancelBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isFuture } from "date-fns";
import { Calendar, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function MemberDashboard() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();

  const myBookings = Array.isArray(bookings) ? bookings.filter(b => b?.userId === user?.id && b?.status === "confirmed") : [];
  
  const upcomingBookings = myBookings
    .filter(b => b?.class && isFuture(new Date(b.class.schedule)))
    .sort((a, b) => new Date(a!.class!.schedule).getTime() - new Date(b!.class!.schedule).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">
          Welcome back, {user?.fullName?.split(' ')[0] || "User"}!
        </h2>
        <p className="text-muted-foreground mt-1">Ready for your next workout?</p>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold mb-2 border border-primary/30">
              ACTIVE MEMBER
            </div>
            <h3 className="text-2xl font-bold font-display mb-1">Premium Access</h3>
            <p className="text-slate-400 text-sm">Valid until Dec 31, 2024</p>
          </div>
          <Link href="/dashboard/schedule">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-lg">
              Book a Class
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold font-display mb-4">Your Upcoming Classes</h3>
        
        {isLoading ? (
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        ) : upcomingBookings.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-900 font-medium">No upcoming bookings</p>
              <p className="text-slate-500 text-sm mb-4">You haven't booked any classes yet.</p>
              <Link href="/dashboard/schedule">
                <Button variant="outline">Browse Schedule</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking?.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="h-2 bg-emerald-500 w-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-lg">{booking?.class?.name}</CardTitle>
                  <CardDescription>with {booking?.class?.trainer?.fullName || "Trainer"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-slate-900">
                        {booking?.class?.schedule ? format(new Date(booking.class.schedule), "EEE, MMM d") : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{booking?.class?.schedule ? format(new Date(booking.class.schedule), "h:mm a") : "N/A"} ({booking?.class?.duration || 0}m)</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-xs h-8"
                    onClick={() => booking?.id && cancelBooking.mutate(booking.id)}
                    disabled={cancelBooking.isPending}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    {cancelBooking.isPending ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
