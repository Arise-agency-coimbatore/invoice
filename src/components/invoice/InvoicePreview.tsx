'use client';

import { format } from 'date-fns';
import { FileText } from 'lucide-react';

interface InvoicePreviewProps {
  data: {
    client_name: string;
    client_email: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    notes: string;
    subtotal: number;
    tax: number;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
  };
  id?: string;
}

export default function InvoicePreview({ data, id = 'invoice-document' }: InvoicePreviewProps) {
  return (
    <div className="w-full max-w-[800px] mx-auto overflow-hidden animate-fade-in">
       {/* PDF container (White background for export) */}
       <div id={id} className="bg-white text-slate-900 p-8 sm:p-12 min-h-[1100px] shadow-2xl flex flex-col font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
             <div>
                <div className="mb-4">
                   <img src="/logo.png" alt="Arise Logo" className="h-20 object-contain" />
                </div>
                <p className="text-sm text-slate-500 max-w-xs">
                   Where the growth begins.
                </p>
             </div>
             <div className="text-right">
                <h1 className="text-4xl font-black text-slate-900 uppercase mb-1">Invoice</h1>
                <p className="text-slate-500 font-medium">{data.invoice_number || 'INV-XXXX'}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
             <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
                <p className="text-lg font-bold text-slate-900">{data.client_name || 'Client Name'}</p>
                <p className="text-slate-500">{data.client_email || 'client@example.com'}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Issue Date</h3>
                   <p className="text-sm font-semibold text-slate-900">
                      {data.issue_date ? format(new Date(data.issue_date), 'MMM dd, yyyy') : '---'}
                   </p>
                </div>
                <div>
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date</h3>
                   <p className="text-sm font-semibold text-slate-900">
                      {data.due_date ? format(new Date(data.due_date), 'MMM dd, yyyy') : '---'}
                   </p>
                </div>
             </div>
          </div>

          {/* Table */}
          <div className="flex-1">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="border-b-2 border-slate-900">
                      <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                      <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20">Qty</th>
                      <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32">Price</th>
                      <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32">Amount</th>
                   </tr>
                </thead>
                <tbody>
                   {data.items.length > 0 ? (
                      data.items.map((item, idx) => (
                         <tr key={idx} className="border-b border-slate-100">
                            <td className="py-5 font-semibold text-slate-900">{item.name || 'Untitled Service'}</td>
                            <td className="py-5 text-center text-slate-600 font-medium">{item.quantity || 0}</td>
                            <td className="py-5 text-right text-slate-600 font-medium">₹{(item.price || 0).toLocaleString()}</td>
                            <td className="py-5 text-right font-bold text-slate-900">₹{(item.total || 0).toLocaleString()}</td>
                         </tr>
                      ))
                   ) : (
                      <tr className="border-b border-slate-100">
                         <td colSpan={4} className="py-12 text-center text-slate-300 italic">No items added yet</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Footer / Totals */}
          <div className="mt-12 flex justify-between gap-12">
             <div className="flex-1 max-w-sm">
                {data.notes && (
                   <>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</h3>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{data.notes}</p>
                   </>
                )}
             </div>
             <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500 font-medium">Subtotal</span>
                   <span className="text-slate-900 font-bold">₹{data.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500 font-medium">Tax ({data.tax || 0}%)</span>
                   <span className="text-slate-900 font-bold">₹{((data.subtotal * (data.tax || 0)) / 100).toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Total</span>
                   <span className="text-2xl font-black text-slate-900">₹{data.total.toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div className="mt-auto pt-12 text-center border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Thank you for your business</p>
          </div>
       </div>
    </div>
  );
}
