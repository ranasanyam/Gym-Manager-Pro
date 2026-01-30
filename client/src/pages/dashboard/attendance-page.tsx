import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function AttendancePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['/api/attendance'],
    queryFn: async () => {
      // Placeholder data
      return [
        { id: 1, memberName: "John Doe", date: new Date().toISOString(), time: "08:30 AM", method: "QR" },
        { id: 2, memberName: "Jane Smith", date: new Date().toISOString(), time: "09:15 AM", method: "MANUAL" },
      ];
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Attendance</h2>
        <p className="text-muted-foreground mt-1">
          {isOwner ? "View attendance records for your gyms." : "Your workout check-in history."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 font-medium text-sm text-slate-500">
          <div className="col-span-4 pl-2">Member Name</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-3">Check-in Time</div>
          <div className="col-span-2 text-right pr-2">Method</div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading records...</div>
        ) : attendance?.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No attendance records found.</p>
          </div>
        ) : (
          attendance?.map((record: any) => (
            <div key={record.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <div className="col-span-4 flex items-center gap-3 pl-2">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs">
                  {record.memberName.charAt(0)}
                </div>
                <span className="font-medium text-slate-900">{record.memberName}</span>
              </div>
              <div className="col-span-3 text-sm text-slate-600">{format(new Date(record.date), "MMM d, yyyy")}</div>
              <div className="col-span-3 text-sm text-slate-600">{record.time}</div>
              <div className="col-span-2 text-right pr-2">
                <Badge variant={record.method === 'QR' ? 'default' : 'secondary'} className="text-[10px]">
                  {record.method}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
