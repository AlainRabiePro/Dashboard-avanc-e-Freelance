
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, query, where } from "firebase/firestore";
import type { Project, Client } from "@/lib/types";
import type { Subcontractor } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  client: z.string().min(1, "Client name is required."),
  description: z.string().optional(),
  status: z.enum(['Planning', 'In Progress', 'Testing', 'Completed']),
  budget: z.coerce.number().min(0, "Budget must be a positive number."),
  progress: z.number().min(0).max(100),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  subcontractorIds: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function ProjectForm({ project }: { project?: Project }) {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const isEditMode = !!project;
  const { t } = useLanguage();
  
  const toDate = (date: any): Date => {
    if (!date) return new Date();
    if (date.toDate) return date.toDate();
    return new Date(date);
  }

  const clientsQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "clients"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: clients } = useCollection<Client>(clientsQuery);
  const subcontractorsQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "subcontractors"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: subcontractors } = useCollection<Subcontractor>(subcontractorsQuery);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: isEditMode ? {
        ...project,
        startDate: toDate(project.startDate),
        endDate: toDate(project.endDate),
        subcontractorIds: project?.subcontractorIds || [],
    } : {
      name: "",
      client: "",
      description: "",
      status: 'Planning',
      budget: 0,
      progress: 0,
      subcontractorIds: [],
    },
  });

  function onSubmit(data: ProjectFormValues) {
    if (!user || !firestore) return;

    const projectData = {
      ...data,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    if (isEditMode) {
      const projectRef = doc(firestore, 'projects', project.id);
      updateDocumentNonBlocking(projectRef, projectData);
      toast({
        title: "Project Updated",
        description: `Project "${data.name}" has been updated.`,
      });
      router.push('/dashboard/projects');
    } else {
      const newProjectData = { ...projectData, createdAt: serverTimestamp(), progress: 0 };
      const projectsCol = collection(firestore, 'projects');
      addDocumentNonBlocking(projectsCol, newProjectData);
      toast({
        title: "Project Created",
        description: `Project "${data.name}" has been created.`,
      });
      router.push('/dashboard/projects');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projectForm.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('projectForm.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('projectForm.client')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('projectForm.clientPlaceholder')} />
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
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('projectForm.budget')}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projectForm.description')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('projectForm.descriptionPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('projectForm.startDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>{t('projectForm.pickDate')}</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="[--cell-size:6.5rem] p-8 text-xl" />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('projectForm.endDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>{t('projectForm.pickDate')}</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="[--cell-size:6.5rem] p-8 text-xl" />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {isEditMode ? (
          <div className="grid md:grid-cols-2 gap-8">
              <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                          <SelectTrigger>
                          <SelectValue placeholder="Select project status" />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {['Planning', 'In Progress', 'Testing', 'Completed'].map(status => (
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
                  name="progress"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Progress ({field.value}%)</FormLabel>
                      <FormControl>
                          <Slider
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => field.onChange(value[0])}
                              value={[field.value]}
                          />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
          </div>
        ) : (
          <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                      <SelectTrigger>
                      <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {['Planning', 'In Progress', 'Testing', 'Completed'].map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                  </SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
              )}
          />
        )}
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="subcontractorIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcontractors <span className="text-xs text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {subcontractors?.map(sub => {
                      const valueArray = Array.isArray(field.value) ? field.value : [];
                      return (
                        <label key={sub.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={sub.id}
                            checked={valueArray.includes(sub.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                field.onChange([...valueArray, sub.id]);
                              } else {
                                field.onChange(valueArray.filter((id: string) => id !== sub.id));
                              }
                            }}
                            className="accent-primary"
                          />
                          <span>{sub.name} <span className="text-xs text-muted-foreground">({sub.specialty})</span></span>
                        </label>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Option calendrier : afficher projets ou sous-traitants dans le calendrier */}
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-medium">Options calendrier</span>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="showProjectsInCalendar" />
              <span>Afficher les projets dans le calendrier</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="showSubcontractorsInCalendar" />
              <span>Afficher les sous-traitants dans le calendrier</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>{isEditMode ? "Update Project" : "Create Project"}</Button>
        </div>
      </form>
    </Form>
  );
}
