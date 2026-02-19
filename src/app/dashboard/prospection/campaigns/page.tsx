'use client';

import { NewsletterCampaignsList } from '@/components/newsletter-campaigns-list';
import { TestEmailButton } from '@/components/test-email-button';

export default function NewsletterCampaignsPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Campagnes de Newsletter</h1>
          <p className="text-gray-500 mt-2">
            Programmez et gérez vos campagnes d'emails automatiques vers vos prospects.
          </p>
        </div>
        <TestEmailButton recipientEmail="alain.rabie.pro@gmail.com" />
      </div>
      <NewsletterCampaignsList />
    </div>
  );
}
