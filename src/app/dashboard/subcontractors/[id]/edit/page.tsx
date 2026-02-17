
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Subcontractor } from '@/lib/types';
import { SubcontractorForm } from '../../new/subcontractor-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSubcontractorPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const subcontractorRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'subcontractors', id) : null, [firestore, id]);
  const { data: subcontractor, isLoading } = useDoc<Subcontractor>(subcontractorRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Subcontractor</CardTitle>
        <CardDescription>
          Update the details of your subcontractor below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <SubcontractorFormSkeleton />}
        {subcontractor && <SubcontractorForm subcontractor={subcontractor} />}
        {!isLoading && !subcontractor && (
          <div className="text-center py-10">
            <p>Subcontractor not found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubcontractorFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      </div>
       <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-20 w-full" /></div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
