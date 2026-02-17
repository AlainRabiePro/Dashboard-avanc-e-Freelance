'use client';

import * as React from 'react';
import type { Project, Task } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ListFilter,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TaskFormDialog } from './task-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';


interface TaskListProps {
  tasks: Task[];
  projects: Project[];
}

const statusBadgeVariants = {
  Todo: 'outline',
  'In Progress': 'secondary',
  'In Review': 'default',
  Done: 'default',
} as const;

const priorityBadgeVariants = {
  Low: 'outline',
  Medium: 'secondary',
  High: 'default',
  Critical: 'destructive',
} as const;


export function TaskList({ tasks: initialTasks, projects }: TaskListProps) {
  const [filter, setFilter] = React.useState('');
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const { firestore } = useFirebase();
  const { toast } = useToast();


  const tasksWithProjectNames = React.useMemo(() => {
    return initialTasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      return {
        ...task,
        projectName: project ? project.name : 'Unknown Project',
      };
    });
  }, [initialTasks, projects]);

  const filteredTasks = React.useMemo(() => {
    return tasksWithProjectNames.filter(task =>
      task.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tasksWithProjectNames, filter]);

  const handleDelete = () => {
    if (!taskToDelete || !firestore) return;
    const taskRef = doc(firestore, 'tasks', taskToDelete.id);
    deleteDocumentNonBlocking(taskRef);
    toast({
      title: "Task Deleted",
      description: `Task "${taskToDelete.title}" has been deleted.`,
    });
    setTaskToDelete(null);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in tasks..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['Todo', 'In Progress', 'In Review', 'Done'].map(status => (
                  <DropdownMenuCheckboxItem key={status}>
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariants[task.status] || 'outline'}>{task.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityBadgeVariants[task.priority] || 'default'}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.projectName}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <TaskFormDialog task={task} projects={projects}>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                             </DropdownMenuItem>
                          </TaskFormDialog>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task <span className="font-bold">{taskToDelete?.title}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: "destructive" }))}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
