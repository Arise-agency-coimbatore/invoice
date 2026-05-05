'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Save, Download, FileText, User, Mail, Calendar, Hash, Percent, StickyNote, Briefcase, Import } from 'lucide-react';
import LineItemRow from './LineItemRow';
import { downloadInvoicePDF } from '@/lib/pdf';
import { useInvoiceStore, Client, Project, Task } from '@/store/invoiceStore';
import { useToastStore } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

interface InvoiceFormValues {
  client_name: string;
  client_email: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  notes: string;
  tax: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface InvoiceFormProps {
  onDataChange: (data: any) => void;
  initialData?: any;
}

export default function InvoiceForm({ onDataChange, initialData }: InvoiceFormProps) {
  const router = useRouter();
  const { createInvoice, getNextInvoiceNumber, clients, projects, tasks, isLoading: isSaving } = useInvoiceStore();
  const { addToast } = useToastStore();

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter(p => p.client_id === selectedClientId);
  }, [selectedClientId, projects]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    defaultValues: initialData || {
      client_name: '',
      client_email: '',
      invoice_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: '',
      tax: 0,
      items: [{ name: '', quantity: 1, price: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedValues = useWatch({ control });

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setValue('client_name', client.name);
      setValue('client_email', client.email);
    }
  };

  const importCompletedTasks = () => {
    if (!selectedProjectId) return;
    
    const projectTasks = tasks.filter(t => t.project_id === selectedProjectId && t.status === 'Done');
    if (projectTasks.length === 0) {
       addToast('info', 'No completed tasks found for this project.');
       return;
    }

    const currentItems = getValues('items');
    const isEmpty = currentItems.length === 1 && currentItems[0].name === '' && currentItems[0].price === 0;
    
    if (isEmpty) remove(0);

    projectTasks.forEach(task => {
       append({ name: task.title, quantity: 1, price: 0, total: 0 });
    });

    addToast('success', `Imported ${projectTasks.length} tasks as line items.`);
  };

  useEffect(() => {
    if (!initialData) {
      getNextInvoiceNumber().then((num) => setValue('invoice_number', num));
    }
  }, [getNextInvoiceNumber, setValue, initialData]);

  const calculatedData = useMemo(() => {
    const items = (watchedValues.items || []).map((item: any) => ({
      ...item,
      total: (item?.quantity || 0) * (item?.price || 0),
    }));

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = (subtotal * (watchedValues.tax || 0)) / 100;
    const total = subtotal + taxAmount;

    return {
      ...watchedValues,
      items,
      subtotal,
      total,
    } as any;
  }, [watchedValues]);

  useEffect(() => {
    onDataChange(calculatedData);
  }, [calculatedData, onDataChange]);

  const onSubmit = async (data: InvoiceFormValues) => {
    const itemsWithTotals = data.items.map((item) => ({
      ...item,
      total: item.quantity * item.price,
    }));

    const subtotal = itemsWithTotals.reduce((acc, item) => acc + item.total, 0);
    const total = subtotal + (subtotal * data.tax) / 100;

    const invoiceId = await createInvoice(
      {
        client_name: data.client_name,
        client_email: data.client_email,
        invoice_number: data.invoice_number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        notes: data.notes,
        tax: data.tax,
        subtotal,
        total,
        status: 'Pending',
      },
      itemsWithTotals
    );

    if (invoiceId) {
      addToast('success', 'Invoice created successfully');
      router.push('/dashboard');
    } else {
      addToast('error', 'Failed to save invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 pb-20">
      {/* Client Info Section */}
      <section className="glass-card p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Client Info</h2>
          </div>
          
          <select 
            value={selectedClientId} 
            onChange={(e) => handleClientSelect(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-[10px] sm:text-xs text-navy-200 rounded-lg px-2 py-1 outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="">Select Existing Client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Client Name</label>
            <div className="relative">
              <input
                {...register('client_name', { required: true })}
                className="input-field pl-9"
                placeholder="Business or Person"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
            {errors.client_name && <p className="text-[10px] text-red-400 ml-1">Required</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Client Email</label>
            <div className="relative">
              <input
                type="email"
                {...register('client_email', { required: true })}
                className="input-field pl-9"
                placeholder="client@example.com"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
          </div>
        </div>

        {/* Project Selection */}
        {selectedClientId && (
           <div className="pt-4 border-t border-navy-800 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                 <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 mb-1.5 block ml-1">Link to Project</label>
                    <div className="relative">
                       <select 
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="input-field pl-9 appearance-none"
                       >
                          <option value="">Select Project...</option>
                          {filteredProjects.map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                       </select>
                       <Briefcase className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
                    </div>
                 </div>
                 {selectedProjectId && (
                    <button
                       type="button"
                       onClick={importCompletedTasks}
                       className="btn-secondary py-3 px-4 w-full sm:w-auto whitespace-nowrap"
                    >
                       <Import className="h-4 w-4" />
                       Import Tasks
                    </button>
                 )}
              </div>
           </div>
        )}
      </section>

      {/* Invoice Details Section */}
      <section className="glass-card p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Invoice #</label>
            <div className="relative">
              <input
                {...register('invoice_number', { required: true })}
                className="input-field pl-9"
              />
              <Hash className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Issue Date</label>
            <div className="relative">
              <input
                type="date"
                {...register('issue_date', { required: true })}
                className="input-field pl-9"
              />
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Due Date</label>
            <div className="relative">
              <input
                type="date"
                {...register('due_date')}
                className="input-field pl-9"
              />
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Line Items Section */}
      <section className="glass-card p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Line Items</h2>
          </div>
          <button
            type="button"
            onClick={() => append({ name: '', quantity: 1, price: 0, total: 0 })}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0 space-y-4">
            <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-4 px-2 text-[10px] font-bold uppercase tracking-widest text-navy-500">
              <div className="ml-1">Description</div>
              <div className="text-center">Qty</div>
              <div className="text-center">Price</div>
              <div className="text-center">Total</div>
              <div></div>
            </div>
            {fields.map((field, index) => (
              <LineItemRow
                key={field.id}
                index={index}
                register={register}
                onRemove={remove}
                total={(watchedValues.items?.[index]?.quantity || 0) * (watchedValues.items?.[index]?.price || 0)}
              />
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-navy-800 flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-navy-400 uppercase tracking-wider">Tax (%)</label>
            <div className="relative w-24">
              <input
                type="number"
                {...register('tax', { valueAsNumber: true })}
                className="input-field pl-8"
              />
              <Percent className="absolute left-2.5 top-3 h-3 w-3 text-navy-500" />
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-navy-400 uppercase tracking-widest">Grand Total</p>
             <p className="text-3xl font-black text-cyan-400 text-glow">₹{calculatedData.total.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section className="glass-card p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Notes</h2>
        </div>
        <textarea
          {...register('notes')}
          rows={3}
          className="input-field resize-none"
          placeholder="Payment terms, bank details, etc..."
        />
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary flex-1 py-4 text-base shadow-[0_0_25px_rgba(6,182,212,0.4)]"
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving...' : 'Save Invoice'}
        </button>
        <button
          type="button"
          onClick={() => downloadInvoicePDF('invoice-document', calculatedData.invoice_number || 'INV-PREVIEW')}
          className="btn-secondary py-4 text-base flex-1 sm:flex-none sm:px-8"
        >
          <Download className="h-5 w-5" />
          Preview
        </button>
      </div>
    </form>
  );
}
