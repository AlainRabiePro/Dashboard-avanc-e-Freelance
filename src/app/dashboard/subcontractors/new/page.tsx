
import { SubcontractorForm } from "./subcontractor-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewSubcontractorPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Subcontractor</CardTitle>
        <CardDescription>
          Fill out the form below to add a new subcontractor to your network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SubcontractorForm />
      </CardContent>
    </Card>
  );
}
