"use client";

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  FolderKanban,
  Users,
  LayoutDashboard,
  ListTodo,
  FileText,
  FileSignature,
  Calendar,
  UserCog,
  Briefcase,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/language-context";

export function SidebarNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/projects", label: t("sidebar.projects"), icon: FolderKanban },
    { href: "/dashboard/tasks", label: t("sidebar.tasks"), icon: ListTodo },
    { href: "/dashboard/clients", label: t("sidebar.clients"), icon: Users },
    { href: "/dashboard/subcontractors", label: t("sidebar.subcontractors"), icon: UserCog },
    { href: "/dashboard/schedule", label: t("sidebar.schedule"), icon: Calendar },
  ];

  const financialItems = [
    { href: "/dashboard/invoices", label: t("sidebar.invoices"), icon: FileText },
    { href: "/dashboard/quotes", label: t("sidebar.quotes"), icon: FileSignature },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Briefcase className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">FreelanceForge</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator />
          {financialItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/settings")}
              tooltip={t("sidebar.settings")}
            >
              <Link href="/dashboard/settings">
                <Settings />
                <span>{t("sidebar.settings")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
