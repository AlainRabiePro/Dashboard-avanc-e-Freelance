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
import type { Client } from "@/lib/types";

const clientFormSchema = z.object({
  name: z.string().min(1, "Client name is required."),
  email: z.string().email("A valid email is required."),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['Prospect', 'Active', 'Inactive']),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export function ClientForm({ client }: { client?: Client }) {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const isEditMode = !!client;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: isEditMode ? client : {
      name: "",
      email: "",
      company: "",
      phone: "",
      status: 'Prospect',
      notes: "",
    },
  });

  function onSubmit(data: ClientFormValues) {
    if (!user || !firestore) return;

    const clientData = {
      ...data,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    if (isEditMode) {
      const clientRef = doc(firestore, 'clients', client.id);
      updateDocumentNonBlocking(clientRef, clientData);
      toast({
        title: "Client Updated",
        description: `Client "${data.name}" has been updated.`,
      });
    } else {
      const newClientData = { ...clientData, createdAt: serverTimestamp() };
      const clientsCol = collection(firestore, 'clients');
      addDocumentNonBlocking(clientsCol, newClientData);
      toast({
        title: "Client Created",
        description: `Client "${data.name}" has been created.`,
      });
    }
    router.push('/dashboard/clients');
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
                    <Input placeholder="e.g. Jane Doe" {...field} />
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
                    <Input placeholder="jane.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Client Company Name" {...field} />
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
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select client status" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {['Prospect', 'Active', 'Inactive'].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about the client." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>{isEditMode ? "Update Client" : "Create Client"}</Button>
        </div>
      </form>
    </Form>
  );
}
