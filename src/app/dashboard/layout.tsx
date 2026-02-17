
import type { PropsWithChildren } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { SidebarNavigation } from '@/components/sidebar-navigation';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarNavigation />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
