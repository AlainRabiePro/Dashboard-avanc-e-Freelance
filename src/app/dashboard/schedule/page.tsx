'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { ScheduleEvent } from '@/lib/types';
import { CalendarView } from './calendar';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchedulePage() {
  const { firestore, user } = useFirebase();

  const scheduleEventsQuery = useMemoFirebase(
    () => user?.uid && firestore
      ? query(collection(firestore, 'scheduleEvents'), where('userId', '==', user.uid))
      : null,
    [user?.uid, firestore]
  );
  const { data: events, isLoading } = useCollection<ScheduleEvent>(scheduleEventsQuery);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <CalendarView events={events || []} />
    </div>
  );
}

function CalendarSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[calc(100vh-200px)] w-full" />
        </div>
    )
}
