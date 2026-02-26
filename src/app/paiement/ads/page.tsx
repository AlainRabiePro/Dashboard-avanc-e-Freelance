"use client";

import { useUser } from "@/firebase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, Lock } from "lucide-react";


export default function PaiementAdsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });

  const handlePay = async () => {
    if (!user?.email) {
      alert("Veuillez vous connecter.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "ads", email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur lors de la création de la session Stripe.");
      }
    } catch (e) {
      alert("Erreur réseau ou serveur Stripe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-50 p-0">
      <div className="w-full max-w-7xl min-h-screen bg-slate-900 rounded-none md:rounded-2xl shadow-2xl p-0 md:p-12 flex flex-col md:flex-row gap-0 md:gap-12">
        {/* Méthode de paiement */}
        <div className="flex-1 bg-slate-950 rounded-none md:rounded-xl p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-center min-h-[400px]">
          <h2 className="text-xl font-bold mb-6">Méthode de paiement</h2>
          {user ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <input type="radio" checked readOnly className="accent-sky-500" />
                  <span className="font-semibold">Carte bancaire</span>
                  <CreditCard className="w-5 h-5 ml-2 text-sky-400" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400">Nom sur la carte *</label>
                    <input className="w-full rounded bg-slate-800 text-slate-100 p-2 mt-1 mb-2 outline-none border border-slate-700 focus:border-sky-500" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400">Numéro de carte *</label>
                    <input className="w-full rounded bg-slate-800 text-slate-100 p-2 mt-1 mb-2 outline-none border border-slate-700 focus:border-sky-500" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Expiration *</label>
                    <input className="w-full rounded bg-slate-800 text-slate-100 p-2 mt-1 mb-2 outline-none border border-slate-700 focus:border-sky-500" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="09/27" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">CVC *</label>
                    <input className="w-full rounded bg-slate-800 text-slate-100 p-2 mt-1 mb-2 outline-none border border-slate-700 focus:border-sky-500" value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} placeholder="123" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 opacity-50 cursor-not-allowed">
                <input type="radio" disabled />
                <span>PayPal (bientôt)</span>
              </div>
              <div className="flex items-center gap-2 mb-4 opacity-50 cursor-not-allowed">
                <input type="radio" disabled />
                <span>Apple Pay (bientôt)</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="mb-4 text-slate-400">Vous devez être connecté pour payer.</p>
              <a href={`/register?redirect=/paiement/ads`} className="rounded-full bg-sky-500 px-6 py-2 text-base font-semibold text-slate-950 hover:bg-sky-400 transition-colors">Se connecter ou s'inscrire</a>
            </div>
          )}
        </div>
        {/* Détails commande */}
        <div className="flex-1 bg-slate-950 rounded-none md:rounded-xl p-8 md:p-12 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between min-h-[400px]">
          <h2 className="text-xl font-bold mb-6">Détails de la commande</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <div className="font-semibold text-slate-100">Essentiel</div>
              <div className="text-xs text-slate-400">Abonnement mensuel</div>
            </div>
          </div>
          <ul className="text-sm text-slate-300 mb-4 space-y-1">
            <li>✔️ Toutes les fonctionnalités</li>
            <li>✔️ Support prioritaire</li>
            <li>✔️ Export PDF avancé</li>
            <li>✔️ Automatisations</li>
            <li>✔️ Accès aux nouveautés</li>
            <li>❌ Sans publicités</li>
          </ul>
          <div className="border-t border-slate-800 pt-4 mb-4">
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-sky-400">9,99€ / mois</span>
            </div>
          </div>
          <div className="flex items-center mb-4 text-xs text-slate-400">
            <Lock className="w-4 h-4 mr-1 text-slate-500" />
            Paiement sécurisé par Stripe
          </div>
          {user && (
            <Button onClick={handlePay} disabled={loading} className="w-full text-base font-semibold">
              Payer avec Stripe
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
