'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Quote } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Edit, FileDown, Printer, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function getStatusVariant(status: Quote['status']) {
  switch (status) {
    case 'Accepted': return 'default';
    case 'Sent': return 'secondary';
    case 'Rejected': return 'destructive';
    case 'Draft': return 'outline';
    default: return 'outline';
  }
}

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { firestore } = useFirebase();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);

  const quoteDocRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'quotes', id) : null, [firestore, id]);
  const { data: quote, isLoading } = useDoc<Quote>(quoteDocRef);

  const handleDownloadPdf = async () => {
    const element = quoteRef.current;
    if (!element || !quote) return;

    toast({
      title: 'Generating PDF...',
      description: 'Your quote is being exported as a PDF.',
    });

    try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
      
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const imgX = (pdfWidth - imgWidth * ratio) / 2;

        pdf.addImage(imgData, 'PNG', imgX, 10, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`Quote-${quote.quoteNumber}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: 'PDF Export Failed',
        description: 'An error occurred while generating the PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (!quote || !firestore) return;
    const quoteRef = doc(firestore, 'quotes', quote.id);
    deleteDocumentNonBlocking(quoteRef);
    toast({
      title: "Quote Deleted",
      description: `Quote ${quote.quoteNumber} has been deleted.`,
    });
    router.push('/dashboard/quotes');
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };
  
  if (isLoading) {
    return <QuoteDetailsSkeleton />;
  }

  if (!quote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The quote you are looking for does not exist or you do not have permission to view it.</p>
           <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/quotes"><ArrowLeft className="mr-2 h-4 w-4" />Back to Quotes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/quotes"><ArrowLeft /></Link>
          </Button>
          <h1 className="text-3xl font-bold">Quote {quote.quoteNumber}</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button variant="outline" onClick={handleDownloadPdf}><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
            <Button asChild><Link href={`/dashboard/quotes/${quote.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </div>
      </div>
      <Card ref={quoteRef}>
        <CardHeader>
            <div>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>Issued on {formatDate(quote.issueDate)}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Quoted To</h3>
              <p className="font-medium">{quote.client}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Quote Status</h3>
              <Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-muted-foreground mb-2">Valid Until</h3>
              <p>{formatDate(quote.validUntil)}</p>
            </div>
          </div>
          <Separator className="my-6" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${quote.amount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${quote.amount.toFixed(2)}</span>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete quote <span className="font-bold">{quote.quoteNumber}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: "destructive" }))}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


function QuoteDetailsSkeleton() {
    return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-9 w-48" />
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-20 mb-2 ml-auto" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
          </div>
          <Separator className="my-6" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Separator className="my-6" />
          <div className="flex justify-end">
             <div className="w-full max-w-xs space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-6 w-full" />
             </div>
          </div>
        </CardContent>
      </Card>
      </>
    )
}
