'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useInvoiceStore, Invoice } from '@/store/invoiceStore';
import { Download, CreditCard, CheckCircle, FileText, Sparkles } from 'lucide-react';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { downloadInvoicePDF } from '@/lib/pdf';

export default function PublicInvoicePage() {
  const { token } = useParams();
  const { getInvoiceByToken } = useInvoiceStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    if (token) {
      getInvoiceByToken(token as string).then((data) => {
        setInvoice(data);
        setIsLoading(false);
      });
    }
  }, [token, getInvoiceByToken]);

  const handleDownload = () => {
    if (invoice) {
      downloadInvoicePDF('invoice-document', invoice.invoice_number);
    }
  };

  const upiLink = invoice ? `upi://pay?pa=skalaiarasu3@okaxis&pn=Arise_Coimbatore&am=${invoice.total}&tn=Invoice_${invoice.invoice_number}&cu=INR` : '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-center p-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <FileText className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Invoice Not Found</h1>
        <p className="text-navy-400 max-w-md">The link may have expired or public access has been disabled by the sender.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      {/* Cinematic Greeting Overlay */}
      {showGreeting && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden"
          onClick={() => setShowGreeting(false)}
        >
          {/* Animated Background Elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

          <div className="relative z-10 text-center space-y-8 max-w-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-bounce">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-cyan-400 animate-fade-in">
              Incoming Document
            </h2>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white animate-slide-in-up">
              Hello, <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">{invoice.client_name.split(' ')[0]}</span>
            </h1>
            
            <p className="text-navy-300 text-lg md:text-xl animate-fade-in delay-500 leading-relaxed">
              Your invoice from <span className="text-white font-bold">Arise Coimbatore</span> is ready for review and payment.
            </p>

            <div className="pt-12 animate-fade-in delay-1000">
               <button 
                  className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                  onClick={() => setShowGreeting(false)}
               >
                  <span className="relative z-10 flex items-center gap-2">
                    View Invoice
                    <CheckCircle className="h-5 w-5" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
               <p className="mt-4 text-xs text-navy-500 uppercase tracking-widest">Click anywhere to enter</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-5xl mx-auto p-4 md:p-8 space-y-8 transition-all duration-1000 ${showGreeting ? 'blur-xl opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* Floating Action Header */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-4 z-40">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy-800/50 flex items-center justify-center border border-navy-700/30">
                 <FileText className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                 <h1 className="text-lg font-bold text-white">{invoice.invoice_number}</h1>
                 <p className="text-xs text-navy-400">Total Due: <span className="text-white font-bold">₹{invoice.total.toLocaleString()}</span></p>
              </div>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto">
              <a 
                href={upiLink}
                className="btn-primary flex-1 md:flex-none py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-none shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <CreditCard className="h-5 w-5" />
                Pay via UPI
              </a>
              <button 
                onClick={handleDownload}
                className="btn-secondary flex-1 md:flex-none py-3 px-6"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
           </div>
        </div>

        {/* Invoice Display */}
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white">
           <InvoicePreview data={invoice as any} />
        </div>

        {/* Payment Footer */}
        <div className="glass-card p-8 text-center space-y-6">
           <h3 className="text-xl font-bold text-white">Secure Payment via UPI</h3>
           <p className="text-navy-400 text-sm max-w-md mx-auto">
              Scan the QR code or click the payment button above to pay securely using any UPI app (GPay, PhonePe, Paytm).
           </p>
           
           <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
                 {/* Simplified QR Placeholder - In real app, use a QR generator lib */}
                 <div className="w-48 h-48 bg-slate-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`}
                      alt="UPI QR Code"
                      className="w-full h-full"
                    />
                 </div>
              </div>
           </div>

           <div className="text-xs text-navy-500 uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-navy-800" />
              Pay to: skalaiarasu3@okaxis
              <span className="w-8 h-px bg-navy-800" />
           </div>
        </div>

        <footer className="py-12 text-center">
           <p className="text-navy-500 text-xs uppercase tracking-[0.3em]">Powered by AriseOS</p>
        </footer>
      </div>
    </div>
  );
}
