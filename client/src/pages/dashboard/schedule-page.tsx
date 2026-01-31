import { useClasses } from "@/hooks/use-classes";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SchedulePage() {
  const { data: classes, isLoading } = useClasses();
  const { user } = useAuth();
  const createBooking = useCreateBooking();
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const handleBook = () => {
    if (!selectedClass || !user) return;
    createBooking.mutate({
      userId: user.id,
      classId: selectedClass.id,
      status: "confirmed"
    }, {
      onSuccess: () => setSelectedClass(null)
    });
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading schedule...</div>;
  }

  const upcomingClasses = Array.isArray(classes) ? classes.filter(c => c?.schedule && !isPast(new Date(c.schedule)))
    .sort((a, b) => new Date(a!.schedule).getTime() - new Date(b!.schedule).getTime()) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Class Schedule</h2>
        <p className="text-muted-foreground mt-1">Browse and book upcoming fitness classes.</p>
      </div>

      <div className="space-y-4">
        {upcomingClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No upcoming classes</h3>
            <p className="text-slate-500">Check back later for new schedules.</p>
          </div>
        ) : (
          upcomingClasses.map((cls) => (
            <Card key={cls?.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 w-16 h-16 rounded-xl shrink-0">
                  <span className="text-xs font-bold uppercase">{cls?.schedule ? format(new Date(cls.schedule), "MMM") : ""}</span>
                  <span className="text-xl font-bold">{cls?.schedule ? format(new Date(cls.schedule), "d") : ""}</span>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-slate-900">{cls?.name || "Untitled Class"}</h3>
                    <Badge variant="outline" className="text-xs font-normal">
                      {cls?.duration || 0} min
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-sm">{cls?.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cls?.schedule ? format(new Date(cls.schedule), "h:mm a") : "TBA"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {cls?.trainer?.fullName || "TBA"}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedClass(cls)}
                  className="w-full md:w-auto bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedClass} onOpenChange={(open) => !open && setSelectedClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              You are booking a spot for <strong>{selectedClass?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {selectedClass?.schedule && format(new Date(selectedClass.schedule), "PPP")}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {selectedClass?.schedule && format(new Date(selectedClass.schedule), "p")}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground">Trainer</span>
              <span className="font-medium">{selectedClass?.trainer?.fullName || "TBA"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClass(null)}>Cancel</Button>
            <Button onClick={handleBook} disabled={createBooking.isPending}>
              {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
