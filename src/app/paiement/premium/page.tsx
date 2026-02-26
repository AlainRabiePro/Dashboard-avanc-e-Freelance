// "use client";

// import { useUser } from "@/firebase";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { CreditCard, Lock } from "lucide-react";


// export default function PaiementPremiumPage() {
//   const { user } = useUser();
//   const [loading, setLoading] = useState(false);

//   // Algorithme de Luhn pour vérifier la validité du numéro de carte
//   function isValidCardNumber(number: string) {
//     const digits = number.replace(/\s+/g, "");
//     if (!/^[0-9]{13,19}$/.test(digits)) return false;
//     let sum = 0;
//     let shouldDouble = false;
//     for (let i = digits.length - 1; i >= 0; i--) {
//       let digit = parseInt(digits[i], 10);
//       if (shouldDouble) {
//         digit *= 2;
//         if (digit > 9) digit -= 9;
//       }
//       sum += digit;
//       shouldDouble = !shouldDouble;
//     }
//     return sum % 10 === 0;
//   }
//   // Gestion du numéro de carte : limite à 16 chiffres et ajoute les espaces automatiques (format 0000 0000 0000 0000)
//   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.replace(/[^0-9]/g, '');
//     if (value.length > 16) value = value.slice(0, 16);
//     // Ajoute un espace toutes les 4 chiffres
//     let formatted = value.replace(/(.{4})/g, '$1 ').trim();
//     setCard({ ...card, number: formatted });
//   };

//   // Limite le CVC à 3 chiffres
//   const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.replace(/[^0-9]/g, '');
//     if (value.length > 3) value = value.slice(0, 3);
//     setCard({ ...card, cvc: value });
//   };

//   // Ajout automatique du / dans le champ expiration
//   const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.replace(/[^0-9]/g, '');
//     if (value.length > 4) value = value.slice(0, 4);
//     if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
//     // Vérifie si la date est expirée
//     if (value.length === 5) {
//       const [month, year] = value.split('/');
//       const now = new Date();
//       const inputMonth = parseInt(month, 10);
//       const inputYear = 2000 + parseInt(year, 10);
//       const currentMonth = now.getMonth() + 1;
//       const currentYear = now.getFullYear();
//       if (
//         inputMonth < 1 ||
//         inputMonth > 12 ||
//         inputYear < currentYear ||
//         (inputYear === currentYear && inputMonth < currentMonth)
//       ) {
//         return; // Ignore la saisie si la date est invalide ou expirée
//       }
//     }
//     setCard({ ...card, expiry: value });
//   };

//   const handlePay = async () => {
//     if (!user?.email) {
//       alert("Veuillez vous connecter.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch("/api/create-checkout-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ plan: "premium", email: user.email }),
//       });
//       const data = await res.json();
//       if (data.url) {
//         window.location.href = data.url;
//       } else {
//         alert(data.error || "Erreur lors de la création de la session Stripe.");
//       }
//     } catch (e) {
//       alert("Erreur réseau ou serveur Stripe.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-50 p-0">
//       <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center gap-8">
//         <h2 className="text-2xl font-bold mb-4">S'abonner à Premium</h2>
//         <div className="text-4xl font-semibold text-sky-400 mb-2">14,99€ <span className="text-base text-slate-400">/ mois</span></div>
//         <ul className="text-sm text-slate-300 mb-4 space-y-1">
//           <li>✔️ Toutes les fonctionnalités</li>
//           <li>✔️ Support prioritaire</li>
//           <li>✔️ Export PDF avancé</li>
//           <li>✔️ Automatisations</li>
//           <li>✔️ Accès aux nouveautés</li>
//           <li>✔️ Sans publicités</li>
//         </ul>
//         <div className="flex items-center mb-4 text-xs text-slate-400">
//           <Lock className="w-4 h-4 mr-1 text-slate-500" />
//           Paiement sécurisé par Stripe
//         </div>
//         {user ? (
//           <Button onClick={handlePay} disabled={loading} className="w-full text-base font-semibold">
//             S'abonner
//           </Button>
//         ) : (
//           <a href={`/register?redirect=/paiement/premium`} className="rounded-full bg-sky-500 px-6 py-2 text-base font-semibold text-slate-950 hover:bg-sky-400 transition-colors">Se connecter ou s'inscrire</a>
//         )}
//       </div>
//     </main>
//   );
// }
