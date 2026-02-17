
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
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
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
import type { Subcontractor } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function getStatusVariant(status: Subcontractor['status']) {
  switch (status) {
    case 'Active':
      return 'secondary';
    case 'Inactive':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function SubcontractorsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [subcontractorToDelete, setSubcontractorToDelete] = useState<Subcontractor | null>(null);

  const subcontractorsQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "subcontractors"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: subcontractors, isLoading } = useCollection<Subcontractor>(subcontractorsQuery);

  const handleDelete = () => {
    if (!subcontractorToDelete || !firestore) return;
    const subcontractorRef = doc(firestore, 'subcontractors', subcontractorToDelete.id);
    deleteDocumentNonBlocking(subcontractorRef);
    toast({
      title: "Subcontractor Deleted",
      description: `Subcontractor "${subcontractorToDelete.name}" has been deleted.`,
    });
    setSubcontractorToDelete(null);
  };

  if (isLoading) {
    return <SubcontractorsSkeleton />;
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subcontractors</CardTitle>
            <CardDescription>
              Manage your network of collaborators.
            </CardDescription>
          </div>
          <Link href="/dashboard/subcontractors/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Subcontractor
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcontractors && subcontractors.length > 0 ? (
                subcontractors.map((subcontractor) => (
                  <TableRow key={subcontractor.id}>
                    <TableCell className="font-medium">{subcontractor.name}</TableCell>
                    <TableCell>{subcontractor.specialty}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(subcontractor.status)}>
                        {subcontractor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${subcontractor.hourlyRate}/hr</TableCell>
                    <TableCell>{subcontractor.email}</TableCell>
                    <TableCell>{subcontractor.phone}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild><Link href={`/dashboard/subcontractors/${subcontractor.id}/edit`}>Edit</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSubcontractorToDelete(subcontractor)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No subcontractors found. <Link href="/dashboard/subcontractors/new" className="text-primary underline">Add your first subcontractor!</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!subcontractorToDelete} onOpenChange={(open) => !open && setSubcontractorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subcontractor <span className="font-bold">{subcontractorToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SubcontractorsSkeleton() {
  return (
     <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subcontractors</CardTitle>
          <CardDescription>
            Manage your network of collaborators.
          </CardDescription>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Subcontractor
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hourly Rate</TableHead>
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
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
