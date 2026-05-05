'use client';

import { useEffect, useState } from 'react';
import { useInvoiceStore, Invoice } from '@/store/invoiceStore';
import { ChevronLeft, Download, Trash2, Printer, CheckCircle2, Clock, Share2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { downloadInvoicePDF } from '@/lib/pdf';
import { useToastStore } from '@/store/toastStore';
import StatusBadge from '@/components/invoice/StatusBadge';
import Modal from '@/components/ui/Modal';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getInvoiceWithItems, updateInvoiceStatus, deleteInvoice, toggleInvoiceShare } = useInvoiceStore();
  const { addToast } = useToastStore();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      getInvoiceWithItems(id as string).then((data) => {
        setInvoice(data);
        setIsLoading(false);
      });
    }
  }, [id, getInvoiceWithItems]);

  const handleDownload = () => {
    if (invoice) {
      downloadInvoicePDF('invoice-document', invoice.invoice_number);
      addToast('info', 'Starting PDF download...');
    }
  };

  const handleStatusChange = async (status: Invoice['status']) => {
    if (!invoice) return;
    await updateInvoiceStatus(invoice.id, status);
    setInvoice({ ...invoice, status });
    addToast('success', `Status updated to ${status}`);
  };

  const handleDelete = async () => {
    if (!invoice) return;
    setIsDeleting(true);
    await deleteInvoice(invoice.id);
    addToast('success', 'Invoice deleted');
    router.push('/dashboard');
  };

  const handleShare = async () => {
    if (!invoice) return;
    const token = await toggleInvoiceShare(invoice.id);
    if (token) {
      const shareUrl = `${window.location.origin}/share/${token}`;
      navigator.clipboard.writeText(shareUrl);
      addToast('success', 'Public link copied to clipboard!');
    } else {
      addToast('info', 'Sharing disabled');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Invoice Not Found</h2>
        <p className="text-navy-400 mb-6">The invoice you are looking for does not exist or you don&apos;t have access.</p>
        <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-xl bg-navy-900/50 border border-navy-800 text-navy-400 hover:text-white transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-xl font-bold text-white">{invoice.invoice_number}</h1>
               <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-navy-400">Manage status and actions for this invoice.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Actions */}
          <div className="flex p-1 bg-navy-950/50 rounded-xl border border-navy-800/50 mr-2">
            <button 
              onClick={() => handleStatusChange('Pending')}
              className={`p-2 rounded-lg transition-all ${invoice.status === 'Pending' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-navy-400 hover:text-white'}`}
              title="Mark as Pending"
            >
              <Clock className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleStatusChange('Paid')}
              className={`p-2 rounded-lg transition-all ${invoice.status === 'Paid' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-navy-400 hover:text-white'}`}
              title="Mark as Paid"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>

          <button 
            onClick={handleShare} 
            className={`btn-secondary py-2.5 ${invoice.is_public ? 'border-cyan-500/50 text-cyan-400' : ''}`}
            title={invoice.is_public ? "Copy Public Link" : "Enable Public Sharing"}
          >
            {invoice.is_public ? <LinkIcon className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {invoice.is_public ? 'Shared' : 'Share'}
          </button>

          <button onClick={handleDownload} className="btn-secondary py-2.5">
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button onClick={() => window.print()} className="btn-secondary py-2.5">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn-danger py-2.5">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content: Document Preview */}
      <div className="rounded-2xl overflow-hidden shadow-2xl bg-white ring-1 ring-white/10">
         <InvoicePreview data={invoice as any} />
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? All records of this transaction will be removed."
        confirmText="Confirm Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
