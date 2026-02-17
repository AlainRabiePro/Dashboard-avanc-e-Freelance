'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project, Subcontractor, Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskBoard } from './task-board';
import { TaskList } from './task-list';
import { List, KanbanSquare, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskFormDialog } from './task-form-dialog';


export default function TasksPage() {
  const { firestore, user } = useFirebase();

  const tasksQuery = useMemoFirebase(
    () => user?.uid && firestore
      ? query(collection(firestore, 'tasks'), where('userId', '==', user.uid))
      : null,
    [user?.uid, firestore]
  );
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const projectsQuery = useMemoFirebase(
    () => user?.uid && firestore
      ? query(collection(firestore, 'projects'), where('userId', '==', user.uid))
      : null,
    [user?.uid, firestore]
  );
  const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsQuery);

  const subcontractorsQuery = useMemoFirebase(
    () => user?.uid && firestore
      ? query(collection(firestore, 'subcontractors'), where('userId', '==', user.uid))
      : null,
    [user?.uid, firestore]
  );
  const { data: subcontractors, isLoading: isLoadingSubcontractors } = useCollection<Subcontractor>(subcontractorsQuery);


  const isLoading = isLoadingTasks || isLoadingProjects || isLoadingSubcontractors;

  return (
    <div className="flex flex-col gap-6 h-full">
       <Tabs defaultValue="list" className="h-full flex flex-col">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <p className="text-muted-foreground">
                    Organize and manage your project tasks.
                </p>
            </div>
             <div className="flex items-center gap-2">
              {!isLoading && (
                <TaskFormDialog projects={projects || []} subcontractors={subcontractors || []}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </TaskFormDialog>
              )}
              <TabsList>
                  <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />List</TabsTrigger>
                  <TabsTrigger value="board"><KanbanSquare className="mr-2 h-4 w-4" />Board</TabsTrigger>
              </TabsList>
            </div>
        </div>
        
        <TabsContent value="list" className="flex-1 mt-4">
             {isLoading ? (
                <TaskListSkeleton />
            ) : (
                <TaskList tasks={tasks || []} projects={projects || []} subcontractors={subcontractors || []} />
            )}
        </TabsContent>
        <TabsContent value="board" className="flex-1 -mt-2 overflow-hidden">
            {isLoading ? (
                <TaskBoardSkeleton />
            ) : (
                <TaskBoard tasks={tasks || []} projects={projects || []} subcontractors={subcontractors || []} />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b">
         <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-9 w-24" />
         </div>
         <Skeleton className="h-9 w-24" />
      </div>
      <div className="p-0">
        <div className="p-4 space-y-2">
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </Card>
  )
}

function TaskBoardSkeleton() {
  return (
    <div className="flex-1 overflow-x-auto h-full">
        <div className="flex gap-4 h-full">
          {['Todo', 'In Progress', 'In Review', 'Done'].map(status => (
            <div key={status} className="w-80 shrink-0">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          ))}
      </div>
    </div>
  )
}
