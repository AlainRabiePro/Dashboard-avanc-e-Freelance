import { ProspectForm } from "./prospect-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewProspectPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un prospect</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour ajouter un nouveau prospect à votre pipeline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProspectForm />
      </CardContent>
    </Card>
  );
}
