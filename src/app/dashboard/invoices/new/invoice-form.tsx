"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { CalendarIcon, Loader2, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassicInvoiceTemplate } from "../templates/classic";
import { ModernInvoiceTemplate } from "../templates/modern";
import { MinimalInvoiceTemplate } from "../templates/minimal";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, query, where } from "firebase/firestore";
import type { Invoice, Client } from "@/lib/types";

const invoiceFormSchema = z.object({
  client: z.string().min(1, "Client is required."),
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']),
  template: z.string().min(1, "Template is required."),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required."),
      quantity: z.coerce.number().min(0.01, "Quantity must be positive."),
      unitPrice: z.coerce.number().min(0, "Price must be non-negative."),
    })
  ).min(1, "At least one item is required."),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const [previewData, setPreviewData] = useState<Invoice | null>(invoice ?? null);
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const isEditMode = !!invoice;
  
  const toDate = (date: any): Date => {
    if (date.toDate) return date.toDate();
    return new Date(date);
  }

  const clientsQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "clients"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: clients } = useCollection<Client>(clientsQuery);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: isEditMode ? {
        ...invoice,
        issueDate: toDate(invoice.issueDate),
        dueDate: toDate(invoice.dueDate),
        template: invoice.template || "classic",
    } : {
      client: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-`,
      status: 'Draft',
      template: "classic",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const handleAddItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };


  function onSubmit(data: InvoiceFormValues) {
    if (!user || !firestore) return;

    const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const invoiceData = {
      ...data,
      userId: user.uid,
      amount: totalAmount,
      updatedAt: serverTimestamp(),
      items: data.items.map(item => ({ ...item, total: item.quantity * item.unitPrice })),
    };

    if (isEditMode) {
      const invoiceRef = doc(firestore, 'invoices', invoice.id);
      updateDocumentNonBlocking(invoiceRef, invoiceData);
      toast({
        title: "Invoice Updated",
        description: `Invoice ${data.invoiceNumber} has been updated.`,
      });
    } else {
      const newInvoiceData = { ...invoiceData, createdAt: serverTimestamp() };
      const invoicesCol = collection(firestore, 'invoices');
      addDocumentNonBlocking(invoicesCol, newInvoiceData);
      toast({
        title: "Invoice Created",
        description: `Invoice ${data.invoiceNumber} has been created.`,
      });
    }
    router.push('/dashboard/invoices');
  }

  // Preview rendering logic
  const selectedTemplate = form.watch("template");
  const previewInvoice: Invoice = {
    ...form.getValues(),
    id: invoice?.id ?? "preview",
    userId: invoice?.userId ?? "preview",
    amount: form.getValues().items?.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) ?? 0,
    items: form.getValues().items?.map(item => ({ ...item, total: item.quantity * item.unitPrice })) ?? [],
    createdAt: invoice?.createdAt,
    updatedAt: invoice?.updatedAt,
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients?.map(client => (
                      <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEditMode && <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['Draft', 'Sent', 'Paid', 'Overdue'].map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Line Items</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start border p-4 rounded-lg">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Service or product description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="col-span-4 md:col-span-2">
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <FormItem className="col-span-4 md:col-span-2">
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-3 md:col-span-1 flex items-end h-full">
                 <div className="space-y-2 w-full">
                  <FormLabel>Total</FormLabel>
                  <Input
                    readOnly
                    value={(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unitPrice`)).toFixed(2)}
                  />
                </div>
              </div>

              <div className="col-span-1 flex items-end h-full">
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="mt-8">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>{isEditMode ? "Update Invoice" : "Create Invoice"}</Button>
        </div>
      </form>
    </Form>
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
        <div className="border rounded-lg overflow-hidden shadow-lg flex justify-center">
          {selectedTemplate === "classic" && <ClassicInvoiceTemplate invoice={previewInvoice} />}
          {selectedTemplate === "modern" && <ModernInvoiceTemplate invoice={previewInvoice} />}
          {selectedTemplate === "minimal" && <MinimalInvoiceTemplate invoice={previewInvoice} />}
        </div>
      </div>
    </div>
  );
}
