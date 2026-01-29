import { useState } from "react";
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/use-classes";
import { useUsersList } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClassSchema } from "@shared/schema";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const formSchema = insertClassSchema.extend({
  schedule: z.string(),
});

export default function ClassesPage() {
  const { data: classes, isLoading } = useClasses();
  const deleteClass = useDeleteClass();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Class Management</h2>
          <p className="text-muted-foreground mt-1">Schedule and manage your gym classes.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-blue-600 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Create Class
            </Button>
          </DialogTrigger>
          <CreateClassDialog onClose={() => setIsCreateOpen(false)} />
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes?.map((cls) => (
          <Card key={cls?.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-400" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-display">{cls?.name}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-1">{cls?.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-500 hover:bg-red-50 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => cls?.id && deleteClass.mutate(cls.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Trainer: <span className="font-medium text-slate-900">{cls?.trainer?.fullName || "Unassigned"}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span>{cls?.schedule ? format(new Date(cls.schedule), "PPP p") : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{cls?.duration || 0} minutes</span>
                </div>
                <div className="pt-2 flex items-center gap-2 text-xs font-medium bg-slate-50 p-2 rounded-lg">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">Capacity: {cls?.capacity || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {classes?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CalendarIcon className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No classes scheduled</h3>
            <p className="max-w-xs mt-1">Get started by creating your first class schedule.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateClassDialog({ onClose }: { onClose: () => void }) {
  const createClass = useCreateClass();
  const { data: users } = useUsersList();
  
  const trainers = Array.isArray(users) ? users.filter(u => u?.role === 'trainer') : [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      capacity: 20,
      duration: 60,
      schedule: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createClass.mutate({
      ...values,
      schedule: new Date(values.schedule),
      trainerId: values.trainerId ? Number(values.trainerId) : undefined,
      gymId: 1, // Placeholder
    }, {
      onSuccess: onClose
    });
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogDescription>
          Add a new class to the schedule. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name</FormLabel>
                <FormControl>
                  <Input placeholder="Yoga Flow" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Beginner friendly yoga..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (min)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trainerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trainer</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trainer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer?.id} value={trainer?.id?.toString() || ""}>
                        {trainer?.fullName || "Unknown Trainer"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={createClass.isPending}>
              {createClass.isPending ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
