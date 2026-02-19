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
import { MoreHorizontal, PlusCircle, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
import type { Quote } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function getStatusVariant(status: Quote['status']) {
  switch (status) {
    case 'Accepted':
      return 'default';
    case 'Sent':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    case 'Draft':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function QuotesPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const quotesQuery = useMemoFirebase(
    () => user?.uid && firestore ? query(collection(firestore, "quotes"), where("userId", "==", user.uid)) : null,
    [user?.uid, firestore]
  );
  const { data: quotes, isLoading } = useCollection<Quote>(quotesQuery);

  const handleDelete = () => {
    if (!quoteToDelete || !firestore) return;
    const quoteRef = doc(firestore, 'quotes', quoteToDelete.id);
    deleteDocumentNonBlocking(quoteRef);
    toast({
      title: "Quote Deleted",
      description: `Quote ${quoteToDelete.quoteNumber} has been deleted.`,
    });
    setQuoteToDelete(null);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return <QuotesSkeleton />;
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quotes</CardTitle>
            <CardDescription>
              Manage and track all your quotes.
            </CardDescription>
          </div>
          <Link href="/dashboard/quotes/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quote
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes && quotes.length > 0 ? (
                quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(quote.issueDate)}</TableCell>
                    <TableCell>{formatDate(quote.validUntil)}</TableCell>
                    <TableCell className="text-right">
                      ${quote.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild><Link href={`/dashboard/quotes/${quote.id}`}>View Details</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/dashboard/quotes/${quote.id}/edit`}>Edit</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/dashboard/quotes/${quote.id}?download=true`}>
                            <Download className="mr-2 h-4 w-4" />Télécharger PDF
                          </Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setQuoteToDelete(quote)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
                    No quotes found. <Link href="/dashboard/quotes/new" className="text-primary underline">Create your first quote!</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!quoteToDelete} onOpenChange={(open) => !open && setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete quote <span className="font-bold">{quoteToDelete?.quoteNumber}</span>.
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

function QuotesSkeleton() {
  return (
     <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>
            Manage and track all your quotes.
          </CardDescription>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Quote
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
