
import { Button } from "@/components/ui/button";
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
import { mockInvoices } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getStatusVariant(status: (typeof mockInvoices)[0]['status']) {
  switch (status) {
    case 'Paid':
      return 'default';
    case 'Sent':
      return 'secondary';
    case 'Overdue':
      return 'destructive';
    case 'Draft':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function InvoicesPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Manage and track all your invoices.
          </CardDescription>
        </div>
        <Link href="/dashboard/invoices/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{invoice.issueDate}</TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell className="text-right">
                  ${invoice.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
