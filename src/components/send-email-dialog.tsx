'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Prospect } from '@/lib/types';

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect | null;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  prospect,
}: SendEmailDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prospect) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: prospect.email,
          subject,
          content,
          prospect: {
            companyName: prospect.companyName,
            contactName: prospect.contactName,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      toast({
        title: 'Email envoyé',
        description: `L'email a été envoyé à ${prospect.email}`,
      });

      setSubject('');
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de l\'email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Envoyer un email</DialogTitle>
          <DialogDescription>
            Envoyez un email personnalisé à {prospect?.contactName} ({prospect?.email})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">À</label>
            <Input
              type="email"
              value={prospect?.email || ''}
              disabled
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Sujet *</label>
            <Input
              placeholder="Sujet de l'email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contenu *</label>
            <Textarea
              placeholder="Tapez votre message ici..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
