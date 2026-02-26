'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage, availableLanguages, Language } from '@/context/language-context';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Bell, CreditCard, Lock, LogOut, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, firestore, auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const userProfileRef = useMemoFirebase(
    () => (user?.uid && firestore ? doc(firestore, 'users', user.uid) : null),
    [user?.uid, firestore]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<User>(userProfileRef);

  const handleNotificationChange = (setting: 'emailNotifications' | 'marketingEmails' | 'weeklyReport' | 'invoiceReminders', value: boolean) => {
    if (!user || !firestore) return;

    const userRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(userRef, {
      [setting]: value,
      updatedAt: serverTimestamp(),
    });

    toast({
      title: 'Settings Updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Delete Account',
      description: 'Please contact support to delete your account.',
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('settings.description')}
          </p>
        </div>
        <ThemeToggle />
      </div>
      <Separator />

      {/* Settings Sections */}
      <Accordion type="single" collapsible className="w-full" defaultValue="item-2">
        {/* Appearance */}
        <AccordionItem value="item-2">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span>🎨</span>
              <span>Appearance</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize how Nexlance looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Language */}
        <AccordionItem value="item-3">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span>🌐</span>
              <span>Language & Localization</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Language Preferences</CardTitle>
                <CardDescription>
                  Select your preferred language for the interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language-select">Interface Language</Label>
                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                      <SelectTrigger id="language-select" className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availableLanguages).map(([code, name]) => (
                            <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Notifications */}
        <AccordionItem value="item-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingProfile ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive important updates via email
                            </p>
                        </div>
                        <Switch 
                          id="email-notifications"
                          checked={userProfile?.emailNotifications ?? false}
                          onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="invoice-reminders">Invoice Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                                Get reminders for unpaid invoices
                            </p>
                        </div>
                        <Switch 
                          id="invoice-reminders"
                          checked={userProfile?.invoiceReminders ?? true}
                          onCheckedChange={(value) => handleNotificationChange('invoiceReminders', value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="weekly-report">Weekly Report</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive a summary of your business activity
                            </p>
                        </div>
                        <Switch 
                          id="weekly-report"
                          checked={userProfile?.weeklyReport ?? true}
                          onCheckedChange={(value) => handleNotificationChange('weeklyReport', value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="marketing-emails">Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive news and tips about Nexlance
                            </p>
                        </div>
                        <Switch 
                          id="marketing-emails"
                          checked={userProfile?.marketingEmails ?? false}
                          onCheckedChange={(value) => handleNotificationChange('marketingEmails', value)}
                        />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Security */}
        <AccordionItem value="item-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              <span>Security & Privacy</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start">
                  Change Email Address
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start">
                  Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Billing */}
        <AccordionItem value="item-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>Billing & Subscription</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your subscription and billing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">Abonnement actuel</p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.subscriptionPlan === 'premium'
                        ? 'Sans pub (14,99€/mois)'
                        : userProfile?.subscriptionPlan === 'ads'
                        ? 'Essentiel (9,99€/mois)'
                        : 'Aucun (accès limité)'}
                    </p>
                  </div>
                  <Button
                    variant="default"
                    className="w-full md:w-auto"
                    onClick={() => window.location.href = '/dashboard/settings/abonnement'}
                  >
                    Choisir / Modifier mon abonnement
                  </Button>
                </div>
                <Button variant="outline" className="w-full gap-2 justify-start" disabled>
                  Gérer la facturation (bientôt)
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" disabled>
                  Voir les factures (bientôt)
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Account */}
        <AccordionItem value="item-7">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span>⚙️</span>
              <span>Account Management</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account access and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleLogout} variant="outline" className="w-full gap-2 justify-start">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
                <Button onClick={handleDeleteAccount} variant="destructive" className="w-full gap-2 justify-start">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Deleting your account will permanently remove all your data and cannot be undone.
                </p>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
