
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { ProjectForm } from '../../new/project-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const projectRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'projects', id) : null, [firestore, id]);
  const { data: project, isLoading } = useDoc<Project>(projectRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
        <CardDescription>
          Update the details of your project below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <ProjectFormSkeleton />}
        {project && <ProjectForm project={project} />}
        {!isLoading && !project && (
          <div className="text-center py-10">
            <p>Project not found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-20 w-full" /></div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      </div>
       <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
