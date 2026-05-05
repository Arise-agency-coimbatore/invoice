'use client';

import { useInvoiceStore } from '@/store/invoiceStore';
import { FilePlus, Search, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import InvoiceTable from '@/components/invoice/InvoiceTable';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const { invoices, isLoading } = useInvoiceStore();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Paid' | 'Overdue'>('All');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.status === 'Paid' ? inv.total : 0), 0);
    const pendingAmount = invoices.reduce((acc, inv) => acc + (inv.status === 'Pending' ? inv.total : 0), 0);
    const totalCount = invoices.length;
    const paidCount = invoices.filter(inv => inv.status === 'Paid').length;
    
    return { totalRevenue, pendingAmount, totalCount, paidCount };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesFilter = filter === 'All' || inv.status === filter;
      const matchesSearch = 
        inv.client_name.toLowerCase().includes(search.toLowerCase()) || 
        inv.invoice_number.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [invoices, filter, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-32 bg-navy-900/50 rounded-2xl border border-navy-800" />
        <div className="h-[400px] bg-navy-900/50 rounded-2xl border border-navy-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Invoices</h1>
          <p className="text-navy-400 text-sm">Overview of your billing and payments.</p>
        </div>
        <Link href="/invoices/new" className="btn-primary py-3 px-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <FilePlus className="h-5 w-5" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="cyan" 
        />
        <StatCard 
          label="Pending Payments" 
          value={`₹${stats.pendingAmount.toLocaleString()}`} 
          icon={Clock} 
          color="orange" 
        />
        <StatCard 
          label="Total Invoices" 
          value={stats.totalCount.toString()} 
          icon={CheckCircle} 
          color="green" 
        />
        <StatCard 
          label="Paid Rate" 
          value={stats.totalCount > 0 ? `${Math.round((stats.paidCount / stats.totalCount) * 100)}%` : '0%'} 
          icon={TrendingUp} 
          color="cyan" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-4">
        <div className="flex p-1 bg-navy-950/50 rounded-xl border border-navy-800/50 w-fit">
          {['All', 'Pending', 'Paid', 'Overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                filter === f 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                  : 'text-navy-400 hover:text-navy-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by client or invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
        </div>
      </div>

      {/* Content */}
      {filteredInvoices.length > 0 ? (
        <InvoiceTable invoices={filteredInvoices} />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon={AlertCircle}
            title="No Invoices Found"
            description={invoices.length === 0 ? "You haven't created any invoices yet. Start by creating your first one!" : "No invoices match your search criteria."}
            actionLabel={invoices.length === 0 ? "Create First Invoice" : undefined}
            onAction={invoices.length === 0 ? () => router.push('/invoices/new') : undefined}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: 'cyan' | 'orange' | 'green' }) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/5',
    green: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-500/5',
  };

  return (
    <div className={`p-6 glass-card border-l-4 ${color === 'cyan' ? 'border-l-cyan-500' : color === 'orange' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
