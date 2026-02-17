
import { InvoiceForm } from "./invoice-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewInvoicePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
        <CardDescription>
          Fill out the form below to create a new invoice. Use the AI assistant to generate line item descriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InvoiceForm />
      </CardContent>
    </Card>
  );
}
