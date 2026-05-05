'use client';

import { useState } from 'react';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const [previewData, setPreviewData] = useState<any>({
    client_name: '',
    client_email: '',
    invoice_number: '',
    issue_date: '',
    due_date: '',
    notes: '',
    tax: 0,
    subtotal: 0,
    total: 0,
    items: [],
  });
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-in-up">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-xl bg-navy-900/50 border border-navy-800 text-navy-400 hover:text-white transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Create New Invoice</h1>
            <p className="text-sm text-navy-400">Fill in the details to generate your invoice.</p>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Form */}
        <div className={`lg:col-span-6 xl:col-span-5 ${isPreviewExpanded ? 'hidden lg:block' : 'block'}`}>
           <InvoiceForm onDataChange={setPreviewData} />
        </div>

        {/* Right: Live Preview */}
        <div className={`lg:col-span-6 xl:col-span-7 sticky top-6 ${isPreviewExpanded ? 'lg:col-span-12 xl:col-span-12' : ''}`}>
           <div className="relative group">
              <div className="absolute -top-4 right-4 z-10 flex gap-2">
                 <button 
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="p-2 rounded-lg bg-white shadow-lg text-slate-900 hover:bg-slate-100 transition-all border border-slate-200"
                    title={isPreviewExpanded ? "Minimize" : "Full Screen"}
                 >
                    {isPreviewExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                 </button>
              </div>
              
              <div className={`transition-all duration-500 overflow-hidden rounded-2xl shadow-2xl ${isPreviewExpanded ? 'scale-100' : 'lg:scale-[0.85] xl:scale-[0.9] origin-top'}`}>
                 <InvoicePreview data={previewData} />
              </div>
              
              {/* Mobile preview toggle overlay could be added here if needed */}
           </div>
        </div>
      </div>
    </div>
  );
}
