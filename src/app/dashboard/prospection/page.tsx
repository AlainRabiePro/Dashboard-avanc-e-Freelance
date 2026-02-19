'use client';

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Trash2, Mail, Send } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCollection, useFirebase, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { Prospect } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from "@/context/language-context";
import { SendEmailDialog } from '@/components/single-email-dialog';

function getStatusVariant(status: Prospect['status']) {
  switch (status) {
    case 'Won':
      return 'secondary';
    case 'New':
      return 'default';
    case 'Contacted':
      return 'outline';
    case 'Qualified':
      return 'outline';
    case 'Interested':
      return 'outline';
    case 'Proposal Sent':
      return 'outline';
    case 'Lost':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function ProspectionPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [prospectToDelete, setProspectToDelete] = useState<Prospect | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedProspectForEmail, setSelectedProspectForEmail] = useState<Prospect | null>(null);

  const prospectsQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "prospects"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: prospects, isLoading } = useCollection<Prospect>(prospectsQuery);

  const handleDelete = () => {
    if (!prospectToDelete || !firestore) return;
    const prospectRef = doc(firestore, 'prospects', prospectToDelete.id);
    deleteDocumentNonBlocking(prospectRef);
    toast({
      title: t('prospects.toast.deleted.title'),
      description: `${t('prospects.toast.deleted.description')} "${prospectToDelete.companyName}".`,
    });
    setProspectToDelete(null);
  };

  if (isLoading) {
    return <ProspectionSkeleton />;
  }

  // Calculate statistics
  const totalProspects = prospects?.length || 0;
  const newProspects = prospects?.filter(p => p.status === 'New').length || 0;
  const contactedProspects = prospects?.filter(p => p.status === 'Contacted' || p.status === 'Qualified' || p.status === 'Interested').length || 0;
  const wonProspects = prospects?.filter(p => p.status === 'Won').length || 0;
  const lostProspects = prospects?.filter(p => p.status === 'Lost').length || 0;
  const totalBudget = prospects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProspects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newProspects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactedProspects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{wonProspects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('prospects.title')}</CardTitle>
            <CardDescription>
              {t('prospects.description')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/prospection/campaigns" passHref>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Campagnes
              </Button>
            </Link>
            <Link href="/dashboard/prospection/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('prospects.create')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('prospects.companyName')}</TableHead>
                <TableHead>{t('prospects.contactName')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.email')}</TableHead>
                <TableHead>{t('prospects.lastContact')}</TableHead>
                <TableHead>{t('prospects.source')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects && prospects.length > 0 ? (
                prospects.map((prospect) => (
                  <TableRow key={prospect.id}>
                    <TableCell className="font-medium">{prospect.companyName}</TableCell>
                    <TableCell>{prospect.contactName}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span tabIndex={0} className="outline-none">
                            <Badge
                              variant={getStatusVariant(prospect.status)}
                              className="cursor-pointer select-none"
                            >
                              {prospect.status}
                            </Badge>
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {[
                            'New',
                            'Contacted',
                            'Qualified',
                            'Interested',
                            'Proposal Sent',
                            'Won',
                            'Lost',
                          ].map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={async () => {
                                if (!firestore) return;
                                const prospectRef = doc(firestore, 'prospects', prospect.id);
                                await updateDoc(prospectRef, { status });
                                toast({
                                  title: t('prospects.toast.statusChanged.title'),
                                  description: `${t('prospects.toast.statusChanged.description')} "${prospect.companyName}" → ${status}.`,
                                });
                              }}
                              disabled={prospect.status === status}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>{prospect.email}</TableCell>
                    <TableCell>
                      {prospect.lastContactDate
                        ? new Date(prospect.lastContactDate).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell>{prospect.source || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/prospection/${prospect.id}`}>
                              {t('common.edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedProspectForEmail(prospect);
                            setEmailDialogOpen(true);
                          }}>
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer un email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setProspectToDelete(prospect)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {t('prospects.empty')} <Link href="/dashboard/prospection/new" className="text-primary underline">{t('prospects.createFirst')}</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!prospectToDelete} onOpenChange={(open) => !open && setProspectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.undoWarning')} {t('common.permanentlyDelete')} {t('prospects.deleteWarning')} <span className="font-bold">{prospectToDelete?.companyName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        prospect={selectedProspectForEmail}
      />
    </>
  );
}

function ProspectionSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Prospection</CardTitle>
          <CardDescription>
            Gérez votre pipeline commercial et vos prospects.
          </CardDescription>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un prospect
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dernier contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
