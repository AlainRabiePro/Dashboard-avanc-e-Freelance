'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project, Task } from '@/lib/types';
import { TaskBoard } from './task-board';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

  const isLoading = isLoadingTasks || isLoadingProjects;

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Manage your project tasks with a drag-and-drop Kanban board.
          </CardDescription>
        </CardHeader>
      </Card>
      {isLoading ? (
        <TaskBoardSkeleton />
      ) : (
        <TaskBoard tasks={tasks || []} projects={projects || []} />
      )}
    </div>
  );
}


function TaskBoardSkeleton() {
  return (
    <div className="flex-1 overflow-x-auto">
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
