
import { QuoteForm } from "./quote-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewQuotePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quote</CardTitle>
        <CardDescription>
          Fill out the form below to create a new quote. Use the AI assistant to generate line item descriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuoteForm />
      </CardContent>
    </Card>
  );
}
