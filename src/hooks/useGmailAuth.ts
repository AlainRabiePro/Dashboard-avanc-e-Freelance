'use client';

import { useState, useEffect } from 'react';

interface UseGmailAuthResult {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;
  initiateLogin: () => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

export function useGmailAuth(): UseGmailAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si le token existe au montage
  useEffect(() => {
    const token = localStorage.getItem('gmail_access_token');
    const email = localStorage.getItem('gmail_user_email');
    
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    
    // Vérifier la réponse d'authentification dans l'URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code && !token) {
      exchangeCodeForToken(code);
    } else {
      setIsLoading(false);
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gmail/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'authentification Gmail');
      }

      const data = await response.json();
      
      localStorage.setItem('gmail_access_token', data.access_token);
      localStorage.setItem('gmail_user_email', data.email);
      localStorage.setItem('gmail_refresh_token', data.refresh_token || '');
      
      setIsAuthenticated(true);
      setUserEmail(data.email);
      setError(null);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      setError('Configuration Google manquante');
      return;
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_user_email');
    localStorage.removeItem('gmail_refresh_token');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  const getAccessToken = () => {
    return localStorage.getItem('gmail_access_token');
  };

  return {
    isAuthenticated,
    userEmail,
    isLoading,
    error,
    initiateLogin,
    logout,
    getAccessToken,
  };
}
