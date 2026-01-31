import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGymSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";

export default function CreateGymPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
    },
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

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-display font-bold">Add Gym Details</CardTitle>
          <CardDescription>Register your fitness center to start managing your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gym Name</FormLabel>
                    <FormControl><Input placeholder="Elite Fitness Center" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gym Address</FormLabel>
                    <FormControl><Input placeholder="123 Fitness Ave" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="New York" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl><Input placeholder="1234567890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Label>Gym Images (optional)</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-2"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                />
                <div className="flex gap-3 mt-3">
                  {previews.map((p, idx) => (
                    <div key={p} className="w-24 h-24 rounded overflow-hidden border">
                      <img src={p} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Payment QR Codes (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 border-2 border-dashed rounded-lg text-center text-xs text-muted-foreground">
                    Upload GPay QR (Placeholder)
                   </div>
                   <div className="p-4 border-2 border-dashed rounded-lg text-center text-xs text-muted-foreground">
                    Upload PhonePe QR (Placeholder)
                   </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={createGymMutation.isPending || isUploading}>
                {createGymMutation.isPending || isUploading ? "Saving..." : "Create Gym"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
  </span>
);
