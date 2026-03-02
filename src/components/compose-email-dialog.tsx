'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Send, X, Paperclip, Mail as MailIcon } from 'lucide-react';

interface ContactSuggestion {
  email: string;
  name: string;
}

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  availableEmails?: ContactSuggestion[];
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  onSuccess,
  availableEmails = [],
}: ComposeEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ContactSuggestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Gestion des suggestions
  useEffect(() => {
    if (!to.trim()) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const search = to.toLowerCase();
    const filtered = availableEmails
      .filter(contact =>
        contact.email.toLowerCase().includes(search) ||
        contact.name.toLowerCase().includes(search)
      )
      .slice(0, 8); // Limiter à 8 suggestions

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [to, availableEmails]);

  // Fermer les suggestions au clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectContact = (contact: ContactSuggestion) => {
    setTo(contact.email);
    setShowSuggestions(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!to.trim()) {
      setError('Veuillez entrer une adresse e-mail destinataire');
      return;
    }
    
    if (!validateEmail(to)) {
      setError('Adresse e-mail invalide');
      return;
    }
    
    if (!subject.trim()) {
      setError('Veuillez entrer un sujet');
      return;
    }
    
    if (!body.trim()) {
      setError('Veuillez entrer un message');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Créer le contenu HTML pour l'email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="white-space: pre-wrap; word-wrap: break-word;">
            ${body.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
          </div>
        </div>
      `;

      // Récupérer le token d'accès Gmail depuis localStorage
      const accessToken = localStorage.getItem('gmail_access_token');
      if (!accessToken) {
        throw new Error('Token d\'accès Gmail non trouvé. Veuillez vous reconnecter.');
      }

      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          html: htmlContent,
          accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi');
      }

      setSuccess('Email envoyé avec succès via Gmail!');
      setTo('');
      setSubject('');
      setBody('');
      
      setTimeout(() => {
        setSuccess('');
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTo('');
      setSubject('');
      setBody('');
      setError('');
      setSuccess('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Composer un message</DialogTitle>
          <DialogDescription>
            Remplissez les champs ci-dessous pour envoyer un email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destinataire */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">À</label>
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="adresse@exemple.com ou nom du contact"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setError('');
                }}
                onFocus={() => {
                  if (filteredSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                disabled={isLoading}
                className="bg-background border-input"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-input rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  <div className="p-2 space-y-1">
                    {filteredSuggestions.map((contact, idx) => (
                      <button
                        key={`${contact.email}-${idx}`}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <MailIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate text-foreground">
                            {contact.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {contact.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sujet</label>
            <Input
              type="text"
              placeholder="Entrez le sujet du message"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              className="bg-background border-input"
            />
          </div>

          {/* Corps du message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Message</label>
            <Textarea
              placeholder="Écrivez votre message ici..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              className="bg-background border-input min-h-[300px] resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {body.length} caractères
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
              <Send className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-500">{success}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !to || !subject || !body}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
