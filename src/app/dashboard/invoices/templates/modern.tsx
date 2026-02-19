import React from "react";
import type { Invoice } from "@/lib/types";

export function ModernInvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700';
      case 'Sent': return 'bg-blue-100 text-blue-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-[794px] h-[1123px] mx-auto p-12 bg-white shadow-2xl" style={{ aspectRatio: '1/1.414' }}>
      {/* Header with accent line */}
      <div className="border-b-4 border-indigo-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">FACTURE</h1>
            <p className="text-indigo-600 font-semibold mt-1">Professional Invoice</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-medium">Invoice #</div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{invoice.invoiceNumber}</div>
          </div>
        </div>
      </div>

      {/* Client and Dates Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Client</p>
          <p className="text-lg font-semibold text-gray-900">{invoice.client}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Date d'émission</p>
          <p className="text-gray-700">{invoice.issueDate ? (typeof invoice.issueDate === 'string' ? invoice.issueDate : invoice.issueDate.toLocaleDateString('fr-FR')) : '-'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Date d'échéance</p>
          <p className="text-gray-700">{invoice.dueDate ? (typeof invoice.dueDate === 'string' ? invoice.dueDate : invoice.dueDate.toLocaleDateString('fr-FR')) : '-'}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <div className="bg-indigo-50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-indigo-600">
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Description</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-white">Quantité</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">Prix unit.</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-100 transition-colors">
                  <td className="px-6 py-4 text-gray-800">{item.description}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-gray-700 font-mono">{Number(item.unitPrice).toFixed(2)} €</td>
                  <td className="px-6 py-4 text-right text-gray-900 font-semibold font-mono">{Number(item.total).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Section */}
      <div className="flex justify-end mb-8">
        <div className="w-72">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Sous-total</span>
              <span className="text-gray-900 font-mono">{invoice.amount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">TVA</span>
              <span className="text-gray-900 font-mono">0.00 €</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg font-mono">{invoice.amount.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Merci de votre confiance • Invoice generated {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
