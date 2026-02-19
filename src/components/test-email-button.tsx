'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

interface TestEmailButtonProps {
  recipientEmail?: string;
}

export function TestEmailButton({ recipientEmail = 'alain.rabie.pro@gmail.com' }: TestEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: '🎉 Email de Test - Système de Newsletter',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333;">Coucou! 👋</h1>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Cet email de test confirme que votre système de newsletter fonctionne correctement!
              </p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #333;">
                  <strong>✅ Status:</strong> Système opérationnel
                </p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                  Envoyé à: ${recipientEmail}
                </p>
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Cet email a été envoyé via Resend + Next.js
              </p>
            </div>
          `,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Email envoyé!',
          description: `Email de test envoyé à ${recipientEmail}`,
        });
      } else {
        toast({
          title: '❌ Erreur',
          description: data.message || 'Erreur lors de l\'envoi',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: '❌ Erreur',
        description: 'Une erreur est survenue lors de l\'envoi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSendTest}
      disabled={isLoading}
      variant="outline"
    >
      <Mail className="mr-2 h-4 w-4" />
      {isLoading ? 'Envoi...' : 'Tester l\'envoi'}
    </Button>
  );
}
