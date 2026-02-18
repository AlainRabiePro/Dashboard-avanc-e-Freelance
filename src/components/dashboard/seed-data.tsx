
'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { mockProjects, mockTasks, mockClients, mockInvoices } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Loader2 } from 'lucide-react';
import { collection } from 'firebase/firestore';

export function SeedData() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!user || !firestore) {
      toast({
        title: 'Error',
        description: 'You must be logged in to seed data.',
        variant: 'destructive',
      });
      return;
    }

    setIsSeeding(true);
    toast({
      title: 'Seeding Database',
      description: 'Adding sample clients, projects, tasks, and invoices...',
    });

    try {
      const userId = user.uid;
      const projectsCol = collection(firestore, 'projects');
      const tasksCol = collection(firestore, 'tasks');
      const clientsCol = collection(firestore, 'clients');
      const invoicesCol = collection(firestore, 'invoices');

      for (const client of mockClients) {
        await addDocumentNonBlocking(clientsCol, { ...client, id: undefined, userId });
      }

      for (const project of mockProjects) {
        await addDocumentNonBlocking(projectsCol, { ...project, id: undefined, userId });
      }

      for (const task of mockTasks) {
        await addDocumentNonBlocking(tasksCol, { ...task, id: undefined, userId });
      }

      for (const invoice of mockInvoices) {
        await addDocumentNonBlocking(invoicesCol, { ...invoice, id: undefined, userId });
      }

      toast({
        title: 'Success!',
        description: 'Sample data has been added. The page will now reload.',
      });

      // Give a moment for the user to see the toast before reloading.
      setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: 'Seeding Failed',
        description: 'Could not add sample data. Check the console for errors.',
        variant: 'destructive',
      });
      setIsSeeding(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket /> Welcome to FreelanceForge!
        </CardTitle>
        <CardDescription>
          Your dashboard is connected to Firestore, but your database is currently empty.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center gap-4">
        <p>
          To get you started, you can add some sample projects and tasks to your database.
          This will populate the dashboard and other pages with example content.
        </p>
        <Button onClick={handleSeedData} disabled={isSeeding}>
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            'Seed Sample Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

    