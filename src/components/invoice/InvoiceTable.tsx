'use client';

import { format } from 'date-fns';
import { Eye, Download, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { downloadInvoicePDF } from '@/lib/pdf';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useToastStore } from '@/store/toastStore';
import { useState } from 'react';
import Modal from '../ui/Modal';

interface InvoiceTableProps {
  invoices: any[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const { deleteInvoice } = useInvoiceStore();
  const { addToast } = useToastStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await deleteInvoice(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    addToast('success', 'Invoice deleted successfully');
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-700/30 bg-navy-900/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-navy-700/50 text-[10px] uppercase tracking-[0.2em] text-navy-500 font-bold">
            <th className="px-6 py-4">Invoice #</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-800/40">
          {invoices.map((inv) => (
            <tr key={inv.id} className="group hover:bg-navy-800/20 transition-colors">
              <td className="px-6 py-5">
                 <span className="text-sm font-mono text-cyan-400 font-medium">{inv.invoice_number}</span>
              </td>
              <td className="px-6 py-5">
                <div>
                   <p className="text-sm font-semibold text-white">{inv.client_name}</p>
                   <p className="text-xs text-navy-400">{inv.client_email}</p>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-navy-300">
                 {format(new Date(inv.issue_date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-5">
                 <span className="text-sm font-bold text-white">₹{inv.total.toLocaleString()}</span>
              </td>
              <td className="px-6 py-5 text-center">
                 <StatusBadge status={inv.status} />
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="p-2 rounded-lg text-navy-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => downloadInvoicePDF(`invoice-${inv.id}`, inv.invoice_number)}
                    className="p-2 rounded-lg text-navy-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(inv.id)}
                    className="p-2 rounded-lg text-navy-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Hidden previews for PDF generation of listed invoices */}
      <div className="hidden">
         {invoices.map(inv => (
            <div key={`preview-${inv.id}`} id={`invoice-${inv.id}`}>
               {/* This would be the same preview component but hidden */}
               {/* For simplicity in the table, we'll use a simplified PDF or just handle it on detail page */}
            </div>
         ))}
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
