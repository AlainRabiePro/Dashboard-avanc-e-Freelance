'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { MoreHorizontal, Mail, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { NewsletterCampaignDialog } from './newsletter-campaign-dialog';
import type { Prospect } from '@/lib/types';

interface NewsletterCampaign {
  id: string;
  userId: string;
  campaignName: string;
  subject: string;
  content: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  scheduleDate: Timestamp;
  selectedProspectIds: string[];
  createdAt: Timestamp;
  status: 'scheduled' | 'sent' | 'paused';
  sentCount: number;
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'scheduled':
      return 'default';
    case 'sent':
      return 'secondary';
    case 'paused':
      return 'outline';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'scheduled':
      return 'Programmé';
    case 'sent':
      return 'Envoyé';
    case 'paused':
      return 'En pause';
    default:
      return status;
  }
}

export function NewsletterCampaignsList() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [campaignToDelete, setCampaignToDelete] = useState<NewsletterCampaign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const campaignsQuery = useMemoFirebase(
    () =>
      user?.uid && firestore
        ? query(
            collection(firestore, 'newsletterCampaigns'),
            where('userId', '==', user.uid)
          )
        : null,
    [user?.uid, firestore]
  );

  const prospectsQuery = useMemoFirebase(
    () =>
      user?.uid && firestore
        ? query(
            collection(firestore, 'prospects'),
            where('userId', '==', user.uid)
          )
        : null,
    [user?.uid, firestore]
  );

  const { data: campaigns, isLoading } = useCollection<NewsletterCampaign>(campaignsQuery);
  const { data: prospectsList } = useCollection<Prospect>(prospectsQuery);

  useEffect(() => {
    if (prospectsList) {
      setProspects(prospectsList);
    }
  }, [prospectsList]);

  const handleDelete = async () => {
    if (!campaignToDelete || !firestore) return;

    try {
      await deleteDoc(
        doc(firestore, 'newsletterCampaigns', campaignToDelete.id)
      );
      toast({
        title: 'Campagne supprimée',
        description: `La campagne "${campaignToDelete.campaignName}" a été supprimée.`,
      });
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    }
  };

  const handleSendNow = async (campaign: NewsletterCampaign) => {
    try {
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Email envoyé!',
          description: `${data.sentCount} email(s) ont été envoyés pour la campagne "${campaign.campaignName}"`,
        });
      } else {
        toast({
          title: '❌ Erreur',
          description: data.message || 'Erreur lors de l\'envoi',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: '❌ Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const formatDateTime = (timestamp: Timestamp) => {
    return new Date(timestamp.toMillis()).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <CampaignsSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Campagnes de Newsletter</CardTitle>
            <CardDescription>
              Gérez vos campagnes d'emails programmées et personnalisées.
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la campagne</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Date d'envoi</TableHead>
                <TableHead>Fréquence</TableHead>
                <TableHead>Destinataires</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.campaignName}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {campaign.subject}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(campaign.scheduleDate)}
                    </TableCell>
                    <TableCell>
                      {campaign.frequency === 'once'
                        ? 'Une fois'
                        : campaign.frequency === 'daily'
                          ? 'Quotidien'
                          : campaign.frequency === 'weekly'
                            ? 'Hebdomadaire'
                            : 'Mensuel'}
                    </TableCell>
                    <TableCell>
                      {campaign.selectedProspectIds.length} prospect
                      {campaign.selectedProspectIds.length > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(campaign.status)}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSendNow(campaign)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer maintenant
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setCampaignToDelete(campaign)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Aucune campagne créée. Commencez par en créer une!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewsletterCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prospects={prospects}
        onSuccess={() => {}}
      />

      <AlertDialog
        open={!!campaignToDelete}
        onOpenChange={(open) => !open && setCampaignToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement la campagne{' '}
              <span className="font-bold">"{campaignToDelete?.campaignName}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CampaignsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Campagnes de Newsletter</CardTitle>
          <CardDescription>
            Gérez vos campagnes d'emails programmées et personnalisées.
          </CardDescription>
        </div>
        <Button disabled>
          <Mail className="mr-2 h-4 w-4" />
          Nouvelle campagne
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fréquence</TableHead>
              <TableHead>Destinataires</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
