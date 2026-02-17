
"use client";

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
import { mockProjects } from "@/lib/data";
import { generateInvoiceQuoteDescription } from "@/ai/flows/generate-invoice-quote-description";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const invoiceFormSchema = z.object({
  client: z.string().min(1, "Client is required."),
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  issueDate: z.date({ required_error: "Issue date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required."),
      quantity: z.coerce.number().min(0, "Quantity must be positive."),
      unitPrice: z.coerce.number().min(0, "Price must be positive."),
    })
  ).min(1, "At least one item is required."),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm() {
  const { toast } = useToast();
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      client: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-`,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const [generatingStates, setGeneratingStates] = useState<boolean[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleGenerateDescription = async (index: number) => {
    const keyword = keywords[index];
    if (!keyword) {
      toast({
        title: "Keyword required",
        description: "Please enter a keyword to generate a description.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingStates(prev => { const next = [...prev]; next[index] = true; return next; });
    try {
      const result = await generateInvoiceQuoteDescription({ keyword });
      form.setValue(`items.${index}.description`, result.description, { shouldValidate: true });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Could not generate description from the provided keyword.",
        variant: "destructive",
      });
    } finally {
      setGeneratingStates(prev => { const next = [...prev]; next[index] = false; return next; });
    }
  };

  const handleAddItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0 });
    setGeneratingStates(prev => [...prev, false]);
    setKeywords(prev => [...prev, ""]);
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
    setGeneratingStates(prev => prev.filter((_, i) => i !== index));
    setKeywords(prev => prev.filter((_, i) => i !== index));
  };


  function onSubmit(data: InvoiceFormValues) {
    console.log(data);
    toast({
      title: "Invoice Submitted",
      description: "Your invoice has been created successfully.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockProjects.map(p => p.client).filter((v, i, a) => a.indexOf(v) === i).map(client => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
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
              <FormItem className="flex flex-col pt-2">
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
              <FormItem className="flex flex-col pt-2">
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
                 <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="Keyword (e.g., 'web design')" 
                    value={keywords[index] || ""}
                    onChange={e => setKeywords(prev => { const next = [...prev]; next[index] = e.target.value; return next; })}
                    className="h-9"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => handleGenerateDescription(index)} disabled={generatingStates[index]}>
                    {generatingStates[index] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
                    <span className="ml-2 hidden sm:inline">Generate</span>
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="col-span-4 md:col-span-2">
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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
                      <Input type="number" {...field} />
                    </FormControl>
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
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Form>
  );
}
