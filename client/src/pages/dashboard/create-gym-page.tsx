import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGymSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { id: "basic", title: "Basic Info" },
  { id: "facilities", title: "Facilities" },
  { id: "services", title: "Services" },
  { id: "plans", title: "Membership Plans" },
  { id: "media", title: "Media & Payments" },
];

export default function CreateGymPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  const form = useForm({
    resolver: zodResolver(insertGymSchema),
    defaultValues: {
      name: "",
      address: "",
      city: user?.city || "",
      contactNumber: user?.mobileNumber || "",
      ownerId: user?.id,
      gymImages: [],
      facilities: [],
      services: [],
      membershipPlans: [],
      gpayQr: "",
      phonepeQr: "",
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const { fields: planFields, append: appendPlan, remove: removePlan } = useFieldArray({
    control: form.control,
    name: "membershipPlans",
  });

  const createGymMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.gyms.create.path, {
        method: api.gyms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create gym");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gym created successfully!" });
      setLocation("/gyms");
    },
  });

  async function uploadImages(files: File[]) {
    if (!files || files.length === 0) return [];
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    const res = await fetch('/api/uploads', { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) throw new Error('Image upload failed');
    const body = await res.json();
    return body.urls || [];
  }

  async function onSubmit(values: any) {
    try {
      setIsUploading(true);
      let urls: string[] = [];
      if (selectedFiles.length > 0) {
        urls = await uploadImages(selectedFiles);
      }
      const payload = { ...values, gymImages: urls };
      createGymMutation.mutate(payload);
    } catch (err: any) {
      toast({ title: 'Failed to upload images', description: err.message || String(err) });
    } finally {
      setIsUploading(false);
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${idx <= currentStep ? "bg-primary border-primary text-white" : "border-muted text-muted-foreground"}`}>
                {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium hidden md:block ${idx <= currentStep ? "text-primary" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-display font-bold">{steps[currentStep].title}</CardTitle>
          <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gym Name</FormLabel>
                      <FormControl><Input placeholder="Elite Fitness Center" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="123 Fitness Ave" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="New York" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contactNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl><Input placeholder="1234567890" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <Label>Facilities</Label>
                  <p className="text-sm text-muted-foreground">List the facilities available at your gym (e.g., Shower, Parking, Locker).</p>
                  <FormField control={form.control} name="facilities" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter facilities separated by commas..." 
                          className="min-h-[100px]"
                          value={field.value?.join(", ")}
                          onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center">
                    <Label>Services</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendService({ name: "", price: "", description: "" })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Service
                    </Button>
                  </div>
                  {serviceFields.map((field, index) => (
                    <Card key={field.id} className="p-4 border-dashed">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <FormField control={form.control} name={`services.${index}.name`} render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input placeholder="Service Name (e.g. Personal Training)" {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`services.${index}.price`} render={({ field }) => (
                            <FormItem className="w-32">
                              <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <FormField control={form.control} name={`services.${index}.description`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input placeholder="Brief description" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center">
                    <Label>Membership Plans</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendPlan({ name: "", price: "", duration: "", features: "" })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Plan
                    </Button>
                  </div>
                  {planFields.map((field, index) => (
                    <Card key={field.id} className="p-4 border-dashed">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`membershipPlans.${index}.name`} render={({ field }) => (
                          <FormItem><FormControl><Input placeholder="Plan Name (e.g. Gold Monthly)" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name={`membershipPlans.${index}.price`} render={({ field }) => (
                          <FormItem><FormControl><Input type="number" placeholder="Price" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name={`membershipPlans.${index}.duration`} render={({ field }) => (
                          <FormItem><FormControl><Input placeholder="Duration (e.g. 1 Month)" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name={`membershipPlans.${index}.features`} render={({ field }) => (
                          <FormItem><FormControl><Input placeholder="Features (comma separated)" {...field} /></FormControl></FormItem>
                        )} />
                        <Button type="button" variant="destructive" size="sm" className="md:col-span-2" onClick={() => removePlan(index)}>
                          Remove Plan
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <Label>Gym Images</Label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">Click to upload photos</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
                      </label>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {previews.map((p, idx) => (
                        <div key={p} className="w-20 h-20 rounded-md overflow-hidden border">
                          <img src={p} className="w-full h-full object-cover" alt="preview" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Payment QR Codes (Links/UPI IDs)</Label>
                    <FormField control={form.control} name="gpayQr" render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPay UPI ID/Link</FormLabel>
                        <FormControl><Input placeholder="upi-id@gpay" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phonepeQr" render={({ field }) => (
                      <FormItem>
                        <FormLabel>PhonePe UPI ID/Link</FormLabel>
                        <FormControl><Input placeholder="upi-id@ybl" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createGymMutation.isPending || isUploading}>
                    {createGymMutation.isPending || isUploading ? "Saving..." : "Create Gym"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
