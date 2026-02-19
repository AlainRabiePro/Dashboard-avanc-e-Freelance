'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Prospect } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProspectForm } from '../new/prospect-form';

export default function EditProspectPage() {
  const params = useParams();
  const { firestore } = useFirebase();
  const prospectId = params.id as string;

  const prospectRef = firestore ? doc(firestore, 'prospects', prospectId) : null;
  const { data: prospect, isLoading } = useDoc<Prospect>(prospectRef);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-96" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prospect) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prospect non trouvé</CardTitle>
          <CardDescription>Le prospect que vous recherchez n'existe pas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier le prospect</CardTitle>
        <CardDescription>
          Mettez à jour les informations du prospect.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProspectForm prospect={prospect} />
      </CardContent>
    </Card>
  );
}
