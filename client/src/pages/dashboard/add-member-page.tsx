import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatISO, addDays } from "date-fns";

const goalsOptions = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "build_muscle", label: "Build muscle" },
  { value: "endurance", label: "Improve endurance" },
  { value: "rehab", label: "Rehab / injury recovery" },
  { value: "general", label: "General fitness" },
];

const membershipPlans = [
  { id: "free", label: "Free", membershipType: "FREE", durationDays: 0 },
  { id: "monthly", label: "Monthly (30 days)", membershipType: "PAID", durationDays: 30 },
  { id: "quarterly", label: "Quarterly (90 days)", membershipType: "PAID", durationDays: 90 },
  { id: "yearly", label: "Yearly (365 days)", membershipType: "PAID", durationDays: 365 },
  { id: "personal", label: "Personal (365 days)", membershipType: "PERSONAL", durationDays: 365 },
];

const formSchema = z.object({
  memberType: z.enum(["FREE", "PAID", "PERSONAL"]),
  name: z.string().min(2),
  mobileNumber: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  goals: z.array(z.string()).optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  membershipPlan: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export default function AddMemberPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberType: "PAID",
      name: "",
      mobileNumber: "",
      email: "",
      gender: "male",
      goals: [],
      dob: "",
      address: "",      city: "",      membershipPlan: "monthly",
      startDate: formatISO(new Date(), { representation: "date" }),
      endDate: formatISO(addDays(new Date(), 30), { representation: "date" }),
    },
  });

  const membershipPlan = form.watch("membershipPlan");
  const startDate = form.watch("startDate");

  // compute end date when plan or start date changes
  const computedEndDate = useMemo(() => {
    const plan = membershipPlans.find((p) => p.id === membershipPlan);
    if (!plan) return startDate;
    const days = plan.durationDays || 0;
    const sd = new Date(startDate);
    return formatISO(addDays(sd, days), { representation: "date" });
  }, [membershipPlan, startDate]);

  // keep endDate in sync with computed
  if (form.getValues("endDate") !== computedEndDate) {
    form.setValue("endDate", computedEndDate);
  }

  // sync membership type to selected plan
  const currentPlan = membershipPlans.find((p) => p.id === membershipPlan);
  if (currentPlan && form.getValues("memberType") !== currentPlan.membershipType) {
    form.setValue("memberType", currentPlan.membershipType as any);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const payload = {
        mobileNumber: values.mobileNumber,
        fullName: values.name,
        email: values.email || undefined,
        gender: values.gender,
        ageOrDob: values.dob || undefined,
        address: values.address,
        membershipType: values.memberType,
        membershipPlan: values.membershipPlan,
        goals: values.goals,
        startDate: values.startDate,
        endDate: values.endDate,
      } as any;

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        let body = await res.text().catch(() => '');
        try {
          if (ct.includes('application/json')) {
            const json = JSON.parse(body);
            body = json?.message || body;
          }
        } catch (e) {
          // ignore
        }
        throw new Error(body || 'Failed to add member');
      }

      toast({ title: 'Member added successfully' });
      setLocation('/members');
    } catch (err: any) {
      toast({ title: 'Failed to add member', description: err.message || String(err) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add Member</CardTitle>
          <CardDescription>Fill out member details and create a membership.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">Free</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PERSONAL">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="membershipPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Plan</FormLabel>
                      <FormControl>
                        <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {membershipPlans.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goals</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              { (form.watch("goals") || []).length > 0
                                ? (form.watch("goals") || []).map((g: string) => goalsOptions.find(o => o.value === g)?.label).filter(Boolean).join(', ')
                                : 'Select goals'
                              }
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="min-w-[18rem]">
                            <DropdownMenuLabel>Goals</DropdownMenuLabel>
                            {goalsOptions.map((g) => (
                              <DropdownMenuCheckboxItem
                                key={g.value}
                                checked={(form.watch("goals") || []).includes(g.value)}
                                onCheckedChange={(checked: boolean) => {
                                  const current = form.getValues("goals") || [];
                                  if (checked) {
                                    form.setValue("goals", [...current, g.value]);
                                  } else {
                                    form.setValue("goals", current.filter((c) => c !== g.value));
                                  }
                                }}
                              >
                                {g.label}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add Member'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
