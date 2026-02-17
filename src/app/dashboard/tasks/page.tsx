
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Task management will be available here. This section will allow you to create tasks, assign them, set priorities, and track their status through to completion.</p>
      </CardContent>
    </Card>
  );
}
