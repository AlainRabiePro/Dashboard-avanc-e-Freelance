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
import { MoreHorizontal, PlusCircle, Trash2, Phone, Mail } from "lucide-react";
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
import { collection, query, where, doc } from 'firebase/firestore';
import type { Client } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from "@/context/language-context";

function getStatusVariant(status: Client['status']) {
  switch (status) {
    case 'Active':
      return 'secondary';
    case 'Prospect':
      return 'default';
    case 'Inactive':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function ClientsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const clientsQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "clients"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: clients, isLoading } = useCollection<Client>(clientsQuery);

  const handleDelete = () => {
    if (!clientToDelete || !firestore) return;
    const clientRef = doc(firestore, 'clients', clientToDelete.id);
    deleteDocumentNonBlocking(clientRef);
    toast({
      title: t('clients.toast.deleted.title'),
      description: `${t('clients.toast.deleted.description')} "${clientToDelete.name}".`,
    });
    setClientToDelete(null);
  };

  if (isLoading) {
    return <ClientsSkeleton />;
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('clients.title')}</CardTitle>
            <CardDescription>
              {t('clients.description')}
            </CardDescription>
          </div>
          <Link href="/dashboard/clients/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('clients.create')}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.company')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.email')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients && clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 hover:border-blue-400 transition"
                        >
                          <a href={`mailto:${client.email}`} className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="truncate max-w-[120px]">{client.email}</span>
                          </a>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center gap-2 px-2 py-1 hover:bg-green-50 hover:border-green-400 transition"
                        >
                          <a href={`tel:${client.phone}`} className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span className="truncate max-w-[100px]">{client.phone}</span>
                          </a>
                        </Button>
                      </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit`}>{t('common.edit')}</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setClientToDelete(client)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t('clients.empty')} <Link href="/dashboard/clients/new" className="text-primary underline">{t('clients.createFirst')}</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.undoWarning')} {t('common.permanentlyDelete')} {t('clients.deleteWarning')} <span className="font-bold">{clientToDelete?.name}</span>.
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
    </>
  );
}

function ClientsSkeleton() {
  return (
     <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            Manage your clients and prospects.
          </CardDescription>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Client
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
