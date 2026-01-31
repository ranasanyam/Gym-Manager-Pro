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
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const defaultGymId = searchParams.get('gymId');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ownerGyms } = useQuery<any[]>({
    queryKey: ['/api/gyms/owner'],
  });

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
      address: "",
      city: "",
      membershipPlan: "monthly",
      startDate: formatISO(new Date(), { representation: "date" }),
      endDate: formatISO(addDays(new Date(), 30), { representation: "date" }),
    },
  });

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
        gymId: defaultGymId ? Number(defaultGymId) : (ownerGyms?.[0]?.id),
      } as any;

      if (!payload.gymId) {
        throw new Error("No gym selected or available.");
      }

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.message || 'Failed to add member');
      }

      toast({ title: 'Member added successfully' });
      setLocation('/members');
    } catch (err: any) {
      toast({ title: 'Failed to add member', description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">Add New Member</CardTitle>
          <CardDescription>Register a new member to the gym.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FREE">Free</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="PERSONAL">Personal</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membershipPlans.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormLabel>Fitness Goals</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {(field.value || []).length > 0
                                ? (field.value || []).map(g => goalsOptions.find(o => o.value === g)?.label).join(', ')
                                : "Select goals"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            {goalsOptions.map(option => (
                              <DropdownMenuCheckboxItem
                                key={option.id}
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked 
                                    ? [...current, option.value]
                                    : current.filter(v => v !== option.value)
                                  );
                                }}
                              >
                                {option.label}
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Current residential address" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Start Date</FormLabel>
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
                      <FormLabel>Membership End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation('/members')}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register Member"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
