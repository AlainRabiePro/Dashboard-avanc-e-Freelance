'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Quote } from '@/lib/types';
import { QuoteForm } from '../../new/quote-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function EditQuotePage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const quoteRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'quotes', id) : null, [firestore, id]);
  const { data: quote, isLoading } = useDoc<Quote>(quoteRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Quote #{quote?.quoteNumber}</CardTitle>
        <CardDescription>
          Update the details of your quote below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <QuoteFormSkeleton />}
        {quote && <QuoteForm quote={quote} />}
        {!isLoading && !quote && (
          <div className="text-center py-10">
            <p>Quote not found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <div className="border p-4 rounded-lg space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
