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
import { useFirebase, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage, availableLanguages, Language } from '@/context/language-context';


export default function SettingsPage() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const userProfileRef = useMemoFirebase(
    () => (user?.uid && firestore ? doc(firestore, 'users', user.uid) : null),
    [user?.uid, firestore]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<User>(userProfileRef);

  const handleNotificationChange = (setting: 'emailNotifications' | 'marketingEmails', value: boolean) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end w-full mb-2">
        <ThemeToggle />
      </div>
      <div>
        <h3 className="text-lg font-medium">{t('settings.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>
      <Separator />

      <Accordion type="single" collapsible className="w-full" defaultValue="item-3">
        <AccordionItem value="item-1">
          <AccordionTrigger>{t('settings.appearance.title')}</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appearance.title')}</CardTitle>
                <CardDescription>
                  {t('settings.appearance.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('settings.appearance.theme')}</p>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>{t('settings.language.title')}</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language.title')}</CardTitle>
                <CardDescription>
                  {t('settings.language.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language-select">{t('settings.language.select')}</Label>
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
        <AccordionItem value="item-3">
          <AccordionTrigger>{t('settings.notifications.title')}</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title')}</CardTitle>
                <CardDescription>
                  {t('settings.notifications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingProfile ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">{t('settings.notifications.email.label')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.notifications.email.description')}
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
                            <Label htmlFor="marketing-emails">{t('settings.notifications.marketing.label')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.notifications.marketing.description')}
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
      </Accordion>
    </div>
  );
}
