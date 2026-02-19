import React from "react";
import type { Invoice } from "@/lib/types";

export function MinimalInvoiceTemplate({ invoice }: { invoice: Invoice }) {
  return (
    <div className="w-[794px] h-[1123px] mx-auto p-6 bg-white border text-gray-900 shadow-2xl" style={{ aspectRatio: '1/1.414' }}>
      <div className="mb-2 text-xs text-gray-400">Invoice #{invoice.invoiceNumber}</div>
      <div className="mb-2 font-semibold">{invoice.client}</div>
      <div className="mb-2">{invoice.issueDate ? (typeof invoice.issueDate === 'string' ? invoice.issueDate : invoice.issueDate.toLocaleDateString()) : ''} - {invoice.dueDate ? (typeof invoice.dueDate === 'string' ? invoice.dueDate : invoice.dueDate.toLocaleDateString()) : ''}</div>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">Description</th>
            <th className="text-right py-1">Qty</th>
            <th className="text-right py-1">Unit</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1">{item.description}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">{item.unitPrice.toFixed(2)}</td>
              <td className="py-1 text-right">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right font-bold">{invoice.amount.toFixed(2)} €</div>
    </div>
  );
}
