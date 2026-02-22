
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

interface DashboardHeaderProps {
  showMailTitle?: boolean;
}

export function DashboardHeader({ showMailTitle }: DashboardHeaderProps) {
  const { user, auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: t('auth.logout.successTitle'),
        description: t('auth.logout.successDescription'),
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: t('auth.logout.errorTitle'),
        description: t('auth.logout.errorDescription'),
        variant: "destructive",
      });
    }
  };

  const userInitials = user?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("") || user?.email?.charAt(0).toUpperCase() || "U";
  
  const userAvatarUrl = user?.photoURL;
  const userName = user?.displayName || user?.email;
  const userEmail = user?.email;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1 flex justify-center">
        {showMailTitle && (
          <span className="text-xl font-semibold text-white">Courriel</span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Avatar className="h-9 w-9">
              {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName || ""} />}
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('sidebar.settings')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('auth.logout.button')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
