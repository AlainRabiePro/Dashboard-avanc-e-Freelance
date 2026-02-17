
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import type { Subcontractor } from "@/lib/types";

const subcontractorFormSchema = z.object({
  name: z.string().min(1, "Subcontractor name is required."),
  email: z.string().email("A valid email is required."),
  specialty: z.string().min(1, "Specialty is required."),
  phone: z.string().optional(),
  hourlyRate: z.coerce.number().min(0, "Hourly rate must be a positive number."),
  status: z.enum(['Active', 'Inactive']),
  bio: z.string().optional(),
});

type SubcontractorFormValues = z.infer<typeof subcontractorFormSchema>;

export function SubcontractorForm({ subcontractor }: { subcontractor?: Subcontractor }) {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const isEditMode = !!subcontractor;

  const form = useForm<SubcontractorFormValues>({
    resolver: zodResolver(subcontractorFormSchema),
    defaultValues: isEditMode ? subcontractor : {
      name: "",
      email: "",
      specialty: "",
      phone: "",
      hourlyRate: 0,
      status: 'Active',
      bio: "",
    },
  });

  function onSubmit(data: SubcontractorFormValues) {
    if (!user || !firestore) return;

    const subcontractorData = {
      ...data,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    if (isEditMode) {
      const subcontractorRef = doc(firestore, 'subcontractors', subcontractor.id);
      updateDocumentNonBlocking(subcontractorRef, subcontractorData);
      toast({
        title: "Subcontractor Updated",
        description: `Subcontractor "${data.name}" has been updated.`,
      });
    } else {
      const newSubcontractorData = { ...subcontractorData, createdAt: serverTimestamp() };
      const subcontractorsCol = collection(firestore, 'subcontractors');
      addDocumentNonBlocking(subcontractorsCol, newSubcontractorData);
      toast({
        title: "Subcontractor Created",
        description: `Subcontractor "${data.name}" has been added.`,
      });
    }
    router.push('/dashboard/subcontractors');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. John Smith" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input placeholder="john.smith@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialty</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Web Development, Design" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                    <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {['Active', 'Inactive'].map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="A short bio about the subcontractor's skills and experience." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>{isEditMode ? "Update Subcontractor" : "Create Subcontractor"}</Button>
        </div>
      </form>
    </Form>
  );
}
