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
import { ThemeSidebarButton } from "@/components/theme-toggle";
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
                className="group rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 focus:bg-sky-100/60 dark:focus:bg-sky-900/60 focus:outline-none"
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors duration-200" />
                  <span className="font-medium text-base text-slate-800 dark:text-slate-200 group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-200">{item.label}</span>
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
                className="group rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-slate-800/80 focus:bg-sky-900/60 focus:outline-none"
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors duration-200" />
                  <span className="font-medium text-base group-hover:text-white transition-colors duration-200">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 w-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t("sidebar.theme") || "Thème"}>
                <ThemeSidebarButton />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard/settings")}
                tooltip={t("sidebar.settings")}
                className="group rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-slate-800/80 focus:bg-sky-900/60 focus:outline-none"
              >
                <Link href="/dashboard/settings" className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors duration-200" />
                  <span className="font-medium text-base text-slate-800 dark:text-slate-200 group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-200">{t("sidebar.settings")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </>
  );
}
