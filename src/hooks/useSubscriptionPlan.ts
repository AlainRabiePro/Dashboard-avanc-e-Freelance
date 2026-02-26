import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';

export function useSubscriptionPlan() {
  const { user, firestore } = useUser();
  const userRef = useMemo(() => (user?.uid && firestore ? doc(firestore, 'users', user.uid) : null), [user?.uid, firestore]);
  const { data, isLoading } = useDoc<{ subscriptionPlan?: string; subscriptionActive?: boolean }>(userRef);
  return {
    plan: data?.subscriptionPlan || null,
    active: data?.subscriptionActive || false,
    isLoading,
  };
}
