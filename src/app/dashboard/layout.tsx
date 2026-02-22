'use client';

import type { PropsWithChildren } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { usePathname } from 'next/navigation';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarNavigation />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader showMailTitle={pathname === '/dashboard/mail'} />
<main className="flex-1">{children}</main>     
 </SidebarInset>
    </SidebarProvider>
  );
}
