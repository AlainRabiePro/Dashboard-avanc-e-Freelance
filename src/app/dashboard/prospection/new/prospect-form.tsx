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
import type { Prospect } from "@/lib/types";

const prospectFormSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis."),
  contactName: z.string().min(1, "Le nom du contact est requis."),
  email: z.string().email("Un email valide est requis."),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Interested', 'Proposal Sent', 'Won', 'Lost']),
  notes: z.string().optional(),
  source: z.string().optional(),
  budget: z.coerce.number().optional(),
  lastContactDate: z.string().optional(),
  followUpDate: z.string().optional(),
});

type ProspectFormValues = z.infer<typeof prospectFormSchema>;

export function ProspectForm({ prospect }: { prospect?: Prospect }) {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const isEditMode = !!prospect;

  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectFormSchema),
    defaultValues: isEditMode ? {
      ...prospect,
      lastContactDate: prospect?.lastContactDate ? new Date(prospect.lastContactDate).toISOString().split('T')[0] : "",
      followUpDate: prospect?.followUpDate ? new Date(prospect.followUpDate).toISOString().split('T')[0] : "",
    } : {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      status: 'New',
      notes: "",
      source: "",
      budget: undefined,
      lastContactDate: "",
      followUpDate: "",
    },
  });

  function onSubmit(data: ProspectFormValues) {
    if (!user || !firestore) return;

    const prospectData = {
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || "",
      website: data.website || "",
      industry: data.industry || "",
      status: data.status,
      notes: data.notes || "",
      source: data.source || "",
      budget: data.budget || 0,
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate).toISOString() : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    if (isEditMode) {
      const prospectRef = doc(firestore, 'prospects', prospect!.id);
      updateDocumentNonBlocking(prospectRef, prospectData);
      toast({
        title: "Prospect mis à jour",
        description: `Le prospect "${data.companyName}" a été mis à jour.`,
      });
    } else {
      const newProspectData = { ...prospectData, createdAt: serverTimestamp() };
      const prospectsCol = collection(firestore, 'prospects');
      addDocumentNonBlocking(prospectsCol, newProspectData);
      toast({
        title: "Prospect créé",
        description: `Le prospect "${data.companyName}" a été créé.`,
      });
    }
    router.push('/dashboard/prospection');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'entreprise</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du contact</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Jean Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="contact@example.com" {...field} />
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
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+33 1 23 45 67 89" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Technologie" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Référence, LinkedIn, Site web" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget estimé (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="lastContactDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dernier contact</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="followUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suivi prévu</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="New">Nouveau</SelectItem>
                  <SelectItem value="Contacted">Contacté</SelectItem>
                  <SelectItem value="Qualified">Qualifié</SelectItem>
                  <SelectItem value="Interested">Intéressé</SelectItem>
                  <SelectItem value="Proposal Sent">Proposition envoyée</SelectItem>
                  <SelectItem value="Won">Gagné</SelectItem>
                  <SelectItem value="Lost">Perdu</SelectItem>
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
              <FormLabel>Remarques</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes supplémentaires sur le prospect..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isEditMode ? "Mettre à jour le prospect" : "Créer le prospect"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
