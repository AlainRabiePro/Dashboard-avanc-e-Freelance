import { ClientForm } from "./client-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Client</CardTitle>
        <CardDescription>
          Fill out the form below to add a new client to your records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientForm />
      </CardContent>
    </Card>
  );
}
