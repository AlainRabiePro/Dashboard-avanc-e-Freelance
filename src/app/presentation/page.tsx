"use client";
// app/(marketing)/page.tsx
import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";
const AnimatedChart = dynamic(() => import("./AnimatedChart"), { ssr: false });
import { Calendar } from "@/components/ui/calendar";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* HERO */}
      <section className="w-full pb-24">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-4 bg-slate-950/80 border-b border-slate-800 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-xs font-bold">
              FF
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                FreelanceForge
              </span>
              <span className="text-[11px] text-slate-400">
                Dashboard pour freelances
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="#features" className="text-slate-300 hover:text-slate-100">
              Fonctionnalités
            </Link>
            <Link
              href="#how-it-works"
              className="text-slate-300 hover:text-slate-100"
            >
              Comment ça marche
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium hover:border-slate-300 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Créer un compte
            </Link>
          </nav>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pt-16 md:flex-row md:items-center">
          {/* Texte */}
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
              Pensé pour les freelances modernes
            </p>
            <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Ton cockpit pour piloter
              toute ton activité freelance.
            </h1>
            <p className="mb-8 text-sm text-slate-300 sm:text-base">
              Suis ton revenu, tes projets, tes tâches, tes clients et tes factures
              dans une seule interface claire. Conçu pour remplacer tes fichiers
              Excel et t’éviter la charge mentale.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-sky-500 px-7 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="text-sm text-slate-300 hover:text-slate-100"
              >
                Déjà un compte ? Se connecter →
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Aucune carte bancaire requise. Installe ton dashboard en quelques minutes.
            </p>
          </div>

          {/* Mock dashboard */}
          <div className="relative flex-1">
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-[0_40px_120px_rgba(15,23,42,0.9)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="ml-3 text-[11px]">freelanceforge.app</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Aperçu du dashboard
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 bg-slate-950/40 p-5">
                <div className="col-span-4 space-y-3 md:col-span-2">
                  <div className="rounded-2xl bg-slate-900 p-4">
                    <p className="mb-1 text-[11px] text-slate-400">
                      Revenu total (ce mois)
                    </p>
                    <p className="text-2xl font-semibold">$0</p>
                    <p className="mt-1 text-[11px] text-emerald-400">
                      +0.0 % vs mois dernier
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 p-4">
                    <p className="mb-1 text-[11px] text-slate-400">
                      Projets actifs
                    </p>
                    <p className="text-xl font-semibold">0</p>
                    <p className="text-[11px] text-slate-400">1 projet au total</p>
                  </div>
                </div>

                <div className="col-span-4 space-y-3 md:col-span-2">
                  <div className="rounded-2xl bg-slate-900 p-4">
                    <p className="mb-2 text-[11px] text-slate-400">
                      Tâches en attente
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span>1 tâche</span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]">
                        En cours
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-900 p-4">
                    <p className="mb-2 text-[11px] text-slate-400">
                      Activité récente
                    </p>
                    <p className="text-xs text-slate-300">
                      Projet Dashboard – 1 tâche mise à jour.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <AnimatedChart />
              </div>
            </div>

            <div className="hidden md:block max-w-xs rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-[11px] text-sky-100 shadow-xl mt-4 mx-auto">
              Vue instantanée sur ton activité : revenus, projets, tâches et factures,
              sans tableaux compliqués.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="border-t border-slate-800 bg-slate-950/70"
      >
        <div className="mx-auto max-w-5xl space-y-10 px-6 py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="mb-3 text-2xl font-semibold md:text-3xl">
              Tout ton business freelance, en un seul endroit.
            </h2>
            <p className="text-sm text-slate-300">
              FreelanceForge centralise tes projets, tâches, clients, sous-traitants,
              planning, factures et devis, pour te donner une vue claire en un coup d’œil.
            </p>
          </div>

          <div className="grid gap-6 text-sm md:grid-cols-3">
            <FeatureCard
              title="Suivi du revenu"
              description="Suis ton chiffre d’affaires mois par mois, visualise ta progression et repère les périodes creuses."
            />
            <FeatureCard
              title="Projets & tâches"
              description="Organise tes missions, assigne des tâches et garde le contrôle sur ce qui est en cours."
            />
            <FeatureCard
              title="Clients & sous-traitants"
              description="Gère ton carnet d’adresses et tes collaborations récurrentes en un seul endroit."
            />
            <FeatureCard
              title="Planning"
              description="Planifie tes semaines, évite le surbooking et garde de la visibilité sur ta charge."
            />
            <FeatureCard
              title="Factures & devis"
              description="Crée, envoie et suis tes factures et devis sans perdre le fil."
            />
            <FeatureCard
              title="Vue globale"
              description="Depuis le dashboard, vois en quelques secondes l’état de ta micro‑entreprise."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900"
      >
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm">
          <h2 className="mb-6 text-2xl font-semibold">
            De l’inscription au pilotage, en 3 étapes.
          </h2>
          <ol className="space-y-4">
            <li>
              <span className="font-semibold text-slate-100">
                1. Crée ton compte.
              </span>{" "}
              Renseigne ton activité et ta structure en quelques clics.
            </li>
            <li>
              <span className="font-semibold text-slate-100">
                2. Ajoute tes premiers clients et projets.
              </span>{" "}
              Commence avec ce que tu gères déjà dans tes fichiers.
            </li>
            <li>
              <span className="font-semibold text-slate-100">
                3. Suis ton activité depuis le dashboard.
              </span>{" "}
              Ouvre FreelanceForge chaque matin pour avoir ta vue globale.
            </li>
          </ol>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Pensé pour les freelances, consultants, designers, développeurs
              et créateurs indépendants.
            </p>
            <Link
              href="/register"
              className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Créer mon compte maintenant
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <p className="text-xs text-slate-300">{description}</p>
    </div>
  );
}

export function CalendarDemo() {
  "use client";
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 p-6 rounded-2xl shadow-xl max-w-md mx-auto">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-xl border-none bg-transparent text-white calendar-modern"
        captionLayout="dropdown"
      />
      <style jsx global>{`
        .calendar-modern .rdp-caption_label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
        }
        .calendar-modern .rdp-nav_button {
          background: none;
          color: #fff;
          font-size: 1.5rem;
          margin: 0 0.5rem;
          border-radius: 9999px;
          transition: background 0.2s;
        }
        .calendar-modern .rdp-nav_button:hover {
          background: #333;
        }
        .calendar-modern .rdp-head_cell {
          font-size: 1rem;
          font-weight: 600;
          color: #e5e7eb;
        }
        .calendar-modern .rdp-day {
          color: #fff;
          font-size: 1rem;
          border-radius: 0.5rem;
          transition: background 0.2s, color 0.2s;
        }
        .calendar-modern .rdp-day_selected {
          background: #6366f1;
          color: #fff;
        }
        .calendar-modern .rdp-day:hover {
          background: #27272a;
          color: #fff;
        }
        .calendar-modern .rdp-day_today {
          background: #f59e42;
          color: #fff;
        }
      `}</style>
    </div>
  )
}
