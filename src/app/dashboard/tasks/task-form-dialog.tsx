'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { Project, Subcontractor, Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import { TASK_STATUSES } from './task-board';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required.'),
  status: z.enum(['Todo', 'In Progress', 'In Review', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  assignedTo: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  task?: Task;
  projects: Project[];
  subcontractors: Subcontractor[];
  children: React.ReactNode; // The trigger
  defaultStatus?: Task['status'];
}

export function TaskFormDialog({ task, projects, subcontractors, children, defaultStatus }: TaskFormDialogProps) {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const isEditMode = !!task;
  const [isOpen, setIsOpen] = useState(false);

  const toDate = (date: any): Date => {
    if (!date) return new Date();
    if (date.toDate) return date.toDate();
    return new Date(date);
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      projectId: task?.projectId ?? '',
      status: task?.status ?? defaultStatus ?? 'Todo',
      priority: task?.priority ?? 'Medium',
      dueDate: toDate(task?.dueDate),
      assignedTo: task?.assignedTo ?? '',
    },
  });
  
  React.useEffect(() => {
    if (isOpen) {
        form.reset({
          title: task?.title ?? '',
          description: task?.description ?? '',
          projectId: task?.projectId ?? '',
          status: task?.status ?? defaultStatus ?? 'Todo',
          priority: task?.priority ?? 'Medium',
          dueDate: toDate(task?.dueDate),
          assignedTo: task?.assignedTo ?? '',
        })
    }
  }, [isOpen, task, form, defaultStatus]);


  function onSubmit(data: TaskFormValues) {
    if (!user || !firestore) return;

    const taskData = {
      ...data,
      userId: user.uid,
      dueDate: data.dueDate.toISOString(),
      updatedAt: serverTimestamp(),
    };

    if (isEditMode && task) {
      const taskRef = doc(firestore, 'tasks', task.id);
      updateDocumentNonBlocking(taskRef, taskData);
      toast({
        title: 'Task Updated',
        description: `Task "${data.title}" has been updated.`,
      });
    } else {
      const newTaskData = { ...taskData, createdAt: serverTimestamp() };
      const tasksCol = collection(firestore, 'tasks');
      addDocumentNonBlocking(tasksCol, newTaskData);
      toast({
        title: 'Task Created',
        description: `Task "${data.title}" has been created.`,
      });
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your task.' : 'Fill out the form below to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Design the landing page" {...field} />
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
                    <Textarea placeholder="Add more details about the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TASK_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Low', 'Medium', 'High', 'Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!projects || projects.length === 0}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!subcontractors || subcontractors.length === 0}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a subcontractor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {subcontractors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
