'use client';

import { useGmailAuth } from '@/hooks/useGmailAuth';
import { Button } from '@/components/ui/button';
import { Mail, LogOut } from 'lucide-react';
import { useEffect } from 'react';

export function GmailLoginButton() {
  const { isAuthenticated, userEmail, isLoading, error, initiateLogin, logout } = useGmailAuth();

  // L'authentification n'a besoin d'être faite qu'une fois
  if (isLoading) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        Vérification Gmail...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-2">
      {isAuthenticated ? (
        <>
          <div className="text-xs text-muted-foreground mb-2">
            Connecté: {userEmail}
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnecter Gmail
          </Button>
        </>
      ) : (
        <Button
          onClick={initiateLogin}
          size="sm"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Mail className="w-4 h-4 mr-2" />
          Connecter Gmail
        </Button>
      )}
    </div>
  );
}
