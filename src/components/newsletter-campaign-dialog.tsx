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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import type { Prospect } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { EmailTemplates } from './email-templates';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface NewsletterCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospects: Prospect[];
  onSuccess?: () => void;
}

interface CampaignFormData {
  campaignName: string;
  subject: string;
  content: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  sendDate: string;
  sendTime: string;
  selectedProspects: string[];
}

const campaignFormSchema = z.object({
  campaignName: z.string().min(1, 'Le nom est requis'),
  subject: z.string().min(1, 'Le sujet est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
  sendDate: z.string(),
  sendTime: z.string(),
  selectedProspects: z.array(z.string()),
});

export function NewsletterCampaignDialog({
  open,
  onOpenChange,
  prospects,
  onSuccess,
}: NewsletterCampaignDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      campaignName: '',
      subject: '',
      content: '',
      frequency: 'once',
      sendDate: new Date().toISOString().split('T')[0],
      sendTime: '09:00',
      selectedProspects: [],
    },
  });

  const handleSelectAllProspects = () => {
    form.setValue(
      'selectedProspects',
      prospects.map((p) => p.id)
    );
  };

  const handleClearProspects = () => {
    form.setValue('selectedProspects', []);
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (!firestore || !user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté',
        variant: 'destructive',
      });
      return;
    }

    if (data.selectedProspects.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un prospect',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Créer la date en UTC pour éviter les problèmes de fuseau horaire
      const [year, month, day] = data.sendDate.split('-');
      const [hours, minutes] = data.sendTime.split(':');
      
      const sendDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      console.log('sendDateTime:', sendDateTime, 'ISO:', sendDateTime.toISOString());

      // Calcul de la prochaine date d'envoi basée sur la fréquence
      let nextSendDate = new Date(sendDateTime);
      if (data.frequency === 'daily') {
        nextSendDate = new Date(sendDateTime.getTime() + 24 * 60 * 60 * 1000);
      } else if (data.frequency === 'weekly') {
        nextSendDate = new Date(
          sendDateTime.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      } else if (data.frequency === 'monthly') {
        nextSendDate = new Date(sendDateTime);
        nextSendDate.setMonth(nextSendDate.getMonth() + 1);
      }

      const campaignData = {
        userId: user.uid,
        campaignName: data.campaignName,
        subject: data.subject,
        content: data.content,
        frequency: data.frequency,
        scheduleDate: Timestamp.fromDate(sendDateTime),
        nextSendDate: data.frequency === 'once' ? null : Timestamp.fromDate(nextSendDate),
        selectedProspectIds: data.selectedProspects,
        createdAt: Timestamp.now(),
        status: 'scheduled',
        sentCount: 0,
      };

      await addDoc(
        collection(firestore, 'newsletterCampaigns'),
        campaignData
      );

      toast({
        title: 'Campagne créée',
        description: `La campagne "${data.campaignName}" a été programmée avec succès.`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la campagne.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une campagne de newsletter</DialogTitle>
          <DialogDescription>
            Programmez l'envoi de newsletters personnalisées à vos prospects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Form {...form}>
          {/* Informations de la campagne */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informations de la campagne</h3>
            
            <FormField
              control={form.control}
              name="campaignName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la campagne *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Janvier 2026 - Suivi"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet de l'email *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Parlons de votre projet..."
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Contenu du message *</span>
                    <EmailTemplates
                      onSelectTemplate={(subject, content) => {
                        form.setValue('subject', subject);
                        form.setValue('content', content);
                      }}
                    />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tapez votre message ici. Utilisez {{companyName}}, {{contactName}}, {{email}} pour la personnalisation."
                      rows={8}
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormDescription>
                    Variables disponibles: {'{{companyName}}, {{contactName}}, {{email}}'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Planification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Planification</h3>
            
            <FormField
              control={form.control}
              name="sendDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'envoi *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sendTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure d'envoi *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="once">Une seule fois</SelectItem>
                      <SelectItem value="daily">Chaque jour</SelectItem>
                      <SelectItem value="weekly">Chaque semaine</SelectItem>
                      <SelectItem value="monthly">Chaque mois</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sélection des prospects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Destinataires ({form.watch('selectedProspects').length} sélectionnés)
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAllProspects}
                >
                  Tous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClearProspects}
                >
                  Aucun
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-2">
              {prospects.map((prospect) => (
                <label
                  key={prospect.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.watch('selectedProspects').includes(prospect.id)}
                    onChange={(e) => {
                      const selected = form.watch('selectedProspects');
                      if (e.target.checked) {
                        form.setValue('selectedProspects', [...selected, prospect.id]);
                      } else {
                        form.setValue(
                          'selectedProspects',
                          selected.filter((id) => id !== prospect.id)
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{prospect.companyName}</div>
                    <div className="text-xs text-gray-500">{prospect.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
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
              {isLoading ? 'Création en cours...' : 'Créer la campagne'}
            </Button>
          </div>
          </Form>
        </form>
      </DialogContent>
    </Dialog>
  );
}
