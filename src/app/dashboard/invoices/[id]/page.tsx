'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDoc, useFirebase, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Edit, FileDown, Printer, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

function getStatusVariant(status: Invoice['status']) {
  switch (status) {
    case 'Paid': return 'default';
    case 'Sent': return 'secondary';
    case 'Overdue': return 'destructive';
    case 'Draft': return 'outline';
    default: return 'outline';
  }
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const id = params.id as string;
  const { firestore } = useFirebase();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const invoiceDocRef = useMemoFirebase(() => firestore && id ? doc(firestore, 'invoices', id) : null, [firestore, id]);
  const { data: invoice, isLoading } = useDoc<Invoice>(invoiceDocRef);
  const downloadTriggeredRef = useRef(false);

  const handleDownloadPdf = async () => {
    if (!invoice) return;

    toast({
      title: 'Generating PDF...',
      description: 'Your invoice is being exported as a PDF.',
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper functions
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        pdf.setFontSize(options.fontSize || 11);
        pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');
        pdf.text(text, x, y, { align: options.align || 'left' });
        return y;
      };

      // Title
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice', 20, yPosition);
      yPosition += 15;

      // Invoice Details Grid
      const labelFontSize = 9;
      const valueFontSize = 11;
      
      // Left column
      addText('Invoice Number', 20, yPosition, { fontSize: labelFontSize });
      addText(invoice.invoiceNumber, 20, yPosition + 5, { fontSize: valueFontSize, bold: true });
      addText('Client', 20, yPosition + 12, { fontSize: labelFontSize });
      addText(invoice.client, 20, yPosition + 17, { fontSize: valueFontSize });

      // Right column
      const rightX = 110;
      addText('Issue Date', rightX, yPosition, { fontSize: labelFontSize });
      addText(formatDate(invoice.issueDate), rightX, yPosition + 5, { fontSize: valueFontSize, bold: true });
      addText('Due Date', rightX, yPosition + 12, { fontSize: labelFontSize });
      addText(formatDate(invoice.dueDate), rightX, yPosition + 17, { fontSize: valueFontSize, bold: true });

      yPosition += 25;

      // Status
      addText('Status', 20, yPosition, { fontSize: labelFontSize });
      addText(invoice.status, 20, yPosition + 5, { fontSize: valueFontSize, bold: true });
      yPosition += 12;

      // Table Header
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 2;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Description', 20, yPosition);
      pdf.text('Quantity', 120, yPosition, { align: 'right' });
      pdf.text('Unit Price', 150, yPosition, { align: 'right' });
      pdf.text('Total', pageWidth - 20, yPosition, { align: 'right' });

      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 4;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      invoice.items.forEach((item) => {
        pdf.text(item.description, 20, yPosition);
        pdf.text(String(item.quantity), 120, yPosition, { align: 'right' });
        pdf.text(`$${Number(item.unitPrice).toFixed(2)}`, 150, yPosition, { align: 'right' });
        pdf.text(`$${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
        yPosition += 6;
      });

      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      // Totals
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Subtotal', 130, yPosition, { align: 'right' });
      pdf.text(`$${invoice.amount.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

      yPosition += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Total', 130, yPosition, { align: 'right' });
      pdf.text(`$${invoice.amount.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

      // Footer
      yPosition = pageHeight - 20;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });

      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      // Clean up the URL after download
      window.history.replaceState({}, '', `/dashboard/invoices/${id}`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: 'PDF Export Failed',
        description: 'An error occurred while generating the PDF.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (searchParams.get('download') === 'true' && invoice && invoiceRef.current && !downloadTriggeredRef.current) {
      downloadTriggeredRef.current = true;
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, searchParams, id]);

  const handleDelete = () => {
    if (!invoice || !firestore) return;
    const invoiceRef = doc(firestore, 'invoices', invoice.id);
    deleteDocumentNonBlocking(invoiceRef);
    toast({
      title: "Invoice Deleted",
      description: `Invoice ${invoice.invoiceNumber} has been deleted.`,
    });
    router.push('/dashboard/invoices');
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };
  
  if (isLoading) {
    return <InvoiceDetailsSkeleton />;
  }

  if (!invoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The invoice you are looking for does not exist or you do not have permission to view it.</p>
           <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back to Invoices</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
           <Link href="/dashboard/invoices"><ArrowLeft /></Link>
        </Button>
        <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
      </div>
      <Card ref={invoiceRef}>
        <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Issued on {formatDate(invoice.issueDate)}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                <Button variant="outline" onClick={handleDownloadPdf}><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
                <Button asChild><Link href={`/dashboard/invoices/${invoice.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Billed To</h3>
              <p className="font-medium">{invoice.client}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground mb-2">Invoice Status</h3>
              <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-muted-foreground mb-2">Due Date</h3>
              <p>{formatDate(invoice.dueDate)}</p>
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
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${invoice.amount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${invoice.amount.toFixed(2)}</span>
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
              This action cannot be undone. This will permanently delete invoice <span className="font-bold">{invoice.invoiceNumber}</span>.
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


function InvoiceDetailsSkeleton() {
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
