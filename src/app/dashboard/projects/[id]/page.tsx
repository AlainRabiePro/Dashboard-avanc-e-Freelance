
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

function getStatusVariant(status: Project['status']) {
  switch (status) {
    case 'Completed': return 'default';
    case 'In Progress': return 'secondary';
    case 'Planning': return 'outline';
    case 'Testing': return 'destructive';
    default: return 'outline';
  }
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { firestore } = useFirebase();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const projectRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'projects', id) : null, [firestore, id]);
  const { data: project, isLoading } = useDoc<Project>(projectRef);

  const handleDelete = () => {
    if (!project || !firestore) return;
    const projectRef = doc(firestore, 'projects', project.id);
    deleteDocumentNonBlocking(projectRef);
    toast({
      title: "Project Deleted",
      description: `Project ${project.name} has been deleted.`,
    });
    router.push('/dashboard/projects');
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };
  
  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The project you are looking for does not exist or you do not have permission to view it.</p>
           <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/projects"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
           <Link href="/dashboard/projects"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-3xl font-bold">{project.name}</h1>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>For client: {project.client}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild><Link href={`/dashboard/projects/${project.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-muted-foreground">Description</h3>
            <p className="text-sm">{project.description || 'No description provided.'}</p>
          </div>
          <Separator />
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Status</h3>
              <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Budget</h3>
              <p className="font-medium">${project.budget.toLocaleString()}</p>
            </div>
             <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Progress</h3>
                <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-2" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                </div>
            </div>
             <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Start Date</h3>
              <p>{formatDate(project.startDate)}</p>
            </div>
             <div>
              <h3 className="font-semibold text-muted-foreground mb-2">End Date</h3>
              <p>{formatDate(project.endDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project <span className="font-bold">{project.name}</span>.
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

function ProjectDetailsSkeleton() {
    return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-9 w-64" />
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
             <Skeleton className="h-5 w-32" />
             <Skeleton className="h-12 w-full" />
          </div>
          <Separator />
           <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
             <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-28" />
            </div>
             <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-28" />
            </div>
             <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
      </>
    )
}
