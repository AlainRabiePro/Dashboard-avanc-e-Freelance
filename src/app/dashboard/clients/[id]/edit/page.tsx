'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Client } from '@/lib/types';
import { ClientForm } from '../../new/client-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const clientRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'clients', id) : null, [firestore, id]);
  const { data: client, isLoading } = useDoc<Client>(clientRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Client</CardTitle>
        <CardDescription>
          Update the details of your client below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <ClientFormSkeleton />}
        {client && <ClientForm client={client} />}
        {!isLoading && !client && (
          <div className="text-center py-10">
            <p>Client not found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClientFormSkeleton() {
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
      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-20 w-full" /></div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
