import React from "react";
import type { Invoice } from "@/lib/types";

export function ClassicInvoiceTemplate({ invoice }: { invoice: Invoice }) {
  return (
    <div className="w-[794px] h-[1123px] mx-auto p-8 bg-white text-black shadow-2xl" style={{ aspectRatio: '1/1.414' }}>
      <h1 className="text-2xl font-bold mb-4">Invoice</h1>
      <div className="mb-2">Invoice Number: <span className="font-mono">{invoice.invoiceNumber}</span></div>
      <div className="mb-2">Client: <span className="font-semibold">{invoice.client}</span></div>
      <div className="mb-2">Issue Date: {invoice.issueDate ? (typeof invoice.issueDate === 'string' ? invoice.issueDate : invoice.issueDate.toLocaleDateString()) : ''}</div>
      <div className="mb-2">Due Date: {invoice.dueDate ? (typeof invoice.dueDate === 'string' ? invoice.dueDate : invoice.dueDate.toLocaleDateString()) : ''}</div>
      <div className="mb-4">Status: <span className="font-semibold">{invoice.status}</span></div>
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Unit Price</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{item.description}</td>
              <td className="p-2 border text-center">{item.quantity}</td>
              <td className="p-2 border text-right">{Number(item.unitPrice).toFixed(2)}</td>
              <td className="p-2 border text-right">{Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right font-bold text-lg">Total: {invoice.amount.toFixed(2)} €</div>
    </div>
  );
}
