"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";

export default function AbonnementPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const adsRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);

  const handleSubscribe = async (plan: "ads" | "premium") => {
    if (!user?.email) {
      alert("Veuillez vous connecter.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: user.email }),
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

  useEffect(() => {
    const plan = searchParams?.get("plan");
    if (plan === "ads" && adsRef.current) {
      adsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (plan === "premium" && premiumRef.current) {
      premiumRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50 p-4">
      <h1 className="text-2xl font-bold mb-8">Choisissez votre abonnement</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
        {/* Essentiel avec pub */}
        <div ref={adsRef} className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 p-8 flex flex-col items-center shadow-lg relative">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow">Avec publicités</span>
          <h3 className="text-xl font-bold mb-2 mt-4">Essentiel</h3>
          <p className="text-3xl font-extrabold text-sky-400 mb-2">9,99€ / mois</p>
          <ul className="text-base text-slate-300 mb-8 space-y-1 text-center">
            <li>✔️ Toutes les fonctionnalités</li>
            <li>✔️ Support prioritaire</li>
            <li>✔️ Export PDF avancé</li>
            <li>✔️ Automatisations</li>
            <li>✔️ Accès aux nouveautés</li>
            <li>❌ Sans publicités</li>
          </ul>
          <Button onClick={() => handleSubscribe("ads")} disabled={loading} className="w-full">
            S'abonner
          </Button>
        </div>
        {/* Premium sans pub */}
        <div ref={premiumRef} className="flex-1 rounded-2xl border-2 border-sky-500 bg-slate-900 p-8 flex flex-col items-center shadow-xl relative">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow">Sans publicités</span>
          <h3 className="text-xl font-bold mb-2 mt-4">Premium</h3>
          <p className="text-3xl font-extrabold text-sky-400 mb-2">14,99€ / mois</p>
          <ul className="text-base text-slate-300 mb-8 space-y-1 text-center">
            <li>✔️ Toutes les fonctionnalités</li>
            <li>✔️ Support prioritaire</li>
            <li>✔️ Export PDF avancé</li>
            <li>✔️ Automatisations</li>
            <li>✔️ Accès aux nouveautés</li>
            <li>✔️ Sans publicités</li>
          </ul>
          <Button onClick={() => handleSubscribe("premium")} disabled={loading} className="w-full">
            S'abonner
          </Button>
        </div>
      </div>
    </main>
  );
}
