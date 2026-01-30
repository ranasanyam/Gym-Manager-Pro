import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function PaymentsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      // Placeholder data
      return [
        { id: 1, memberName: "John Doe", amount: 1500, method: "GPAY", date: new Date().toISOString(), status: "COMPLETED" },
        { id: 2, memberName: "Jane Smith", amount: 2000, method: "CASH", date: new Date().toISOString(), status: "COMPLETED" },
      ];
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Payments</h2>
        <p className="text-muted-foreground mt-1">
          {isOwner ? "Track gym revenue and member payments." : "Your membership payment history."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 font-medium text-sm text-slate-500">
          <div className="col-span-4 pl-2">Member Name</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Method</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right pr-2">Status</div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading records...</div>
        ) : payments?.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No payment records found.</p>
          </div>
        ) : (
          payments?.map((record: any) => (
            <div key={record.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <div className="col-span-4 flex items-center gap-3 pl-2">
                <span className="font-medium text-slate-900">{record.memberName}</span>
              </div>
              <div className="col-span-2 text-sm font-semibold text-slate-900">₹{record.amount}</div>
              <div className="col-span-2 text-xs text-slate-600 font-medium">{record.method}</div>
              <div className="col-span-2 text-sm text-slate-600">{format(new Date(record.date), "MMM d, yyyy")}</div>
              <div className="col-span-2 text-right pr-2">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px]">
                  {record.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
