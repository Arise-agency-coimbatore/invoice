'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Save, Download, FileText, User, Mail, Calendar, Hash, Percent, StickyNote } from 'lucide-react';
import LineItemRow from './LineItemRow';
import { downloadInvoicePDF } from '@/lib/pdf';
import { useInvoiceStore } from '@/store/invoiceStore';
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
  const { createInvoice, getNextInvoiceNumber, isLoading: isSaving } = useInvoiceStore();
  const { addToast } = useToastStore();

  const {
    register,
    control,
    handleSubmit,
    setValue,
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

  // Load next invoice number on mount if not provided
  useEffect(() => {
    if (!initialData) {
      getNextInvoiceNumber().then((num) => setValue('invoice_number', num));
    }
  }, [getNextInvoiceNumber, setValue, initialData]);

  // Calculate totals and notify parent for preview
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      {/* Client Info Section */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Client Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-navy-400 ml-1">Client Name</label>
            <div className="relative">
              <input
                {...register('client_name', { required: true })}
                className="input-field pl-9"
                placeholder="Business or Person"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
            {errors.client_name && <p className="text-[10px] text-red-400 ml-1">Client name is required</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-navy-400 ml-1">Client Email</label>
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
      </section>

      {/* Invoice Details Section */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Invoice Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-navy-400 ml-1">Invoice Number</label>
            <div className="relative">
              <input
                {...register('invoice_number', { required: true })}
                className="input-field pl-9"
              />
              <Hash className="absolute left-3 top-3 h-4 w-4 text-navy-500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-navy-400 ml-1">Issue Date</label>
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
            <label className="text-xs font-medium text-navy-400 ml-1">Due Date</label>
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
      <section className="glass-card p-6 space-y-6">
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

        <div className="space-y-4">
          {fields.map((field, index) => (
            <LineItemRow
              key={field.id}
              index={index}
              register={register}
              onRemove={remove}
              total={(watchedValues.items?.[index]?.quantity || 0) * (watchedValues.items?.[index]?.price || 0)}
            />
          ))}
          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-navy-800 rounded-xl">
              <p className="text-sm text-navy-500">No items added. Click &quot;Add Item&quot; to begin.</p>
            </div>
          )}
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
             <p className="text-xs text-navy-400 uppercase tracking-widest">Grand Total</p>
             <p className="text-3xl font-black text-cyan-400 text-glow">₹{calculatedData.total.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-200">Notes & Terms</h2>
        </div>
        <textarea
          {...register('notes')}
          rows={3}
          className="input-field resize-none"
          placeholder="Additional instructions or payment terms..."
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
          {isSaving ? 'Saving Invoice...' : 'Save Invoice'}
        </button>
        <button
          type="button"
          onClick={() => downloadInvoicePDF('invoice-document', calculatedData.invoice_number || 'INV-PREVIEW')}
          className="btn-secondary py-4 text-base"
        >
          <Download className="h-5 w-5" />
          Download Preview
        </button>
      </div>
    </form>
  );
}
