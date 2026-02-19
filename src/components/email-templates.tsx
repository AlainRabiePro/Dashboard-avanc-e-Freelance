'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailTemplatesProps {
  onSelectTemplate: (subject: string, content: string) => void;
}

const templates = [
  {
    name: 'Suivi Simple',
    subject: 'Suivi - {{companyName}}',
    content: `Bonjour {{contactName}},

J'espère que vous allez bien. Je vous recontacte concernant notre potentiel collaboration pour {{companyName}}.

Auriez-vous un moment cette semaine pour discuter de vos besoins?

Cordialement`,
  },
  {
    name: 'Présentation de Service',
    subject: 'Découvrez nos services pour {{companyName}}',
    content: `Bonjour {{contactName}},

Je suis spécialisé en [VOS SERVICES] et je pense pouvoir aider {{companyName}} à atteindre ses objectifs.

J'aurais aimé vous présenter comment nous pourrions collaborer.

Pouvons-nous fixer un appel rapidement?

Cordialement`,
  },
  {
    name: 'Proposition Value',
    subject: '{{contactName}}, une opportunité pour {{companyName}}',
    content: `Bonjour {{contactName}},

Après avoir étudié {{companyName}}, j'ai identifié 3 leviers pour augmenter votre ROI.

Vous intéresse-t-il un bref appel pour en discuter?

À bientôt,
Cordialement`,
  },
  {
    name: 'Relance Friendly',
    subject: 'Petite relance {{contactName}} 👋',
    content: `Salut {{contactName}},

Pas de nouvelles = bonnes nouvelles? 😊

Je voulais simplement revérifier si mon dernier email vous a intéressé. Si ce n'est pas le bon moment, pas de problème!

Faites-moi signe si vous souhaitez discuter.

À bientôt`,
  },
  {
    name: 'Offre Limitée',
    subject: '⏰ {{contactName}}, offre spéciale pour {{companyName}}',
    content: `Bonjour {{contactName}},

Je lance une offre spéciale ce mois-ci qui pourrait être parfaite pour {{companyName}}.

Cette offre n'est valable que jusqu'à fin du mois.

Êtes-vous intéressé pour en savoir plus?

Cordialement`,
  },
];

export function EmailTemplates({ onSelectTemplate }: EmailTemplatesProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          📋 Modèles
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Modèles d'Email</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onClick={() =>
              onSelectTemplate(template.subject, template.content)
            }
            className="cursor-pointer"
          >
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
