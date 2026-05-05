import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  created_at: string;
  items?: InvoiceItem[];
}

export type NewInvoiceItem = Omit<InvoiceItem, 'id' | 'invoice_id'>;

interface InvoiceState {
  invoices: Invoice[];
  isInitialized: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  createInvoice: (
    invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'items'>,
    items: NewInvoiceItem[]
  ) => Promise<string | null>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getNextInvoiceNumber: () => Promise<string>;
  getInvoiceWithItems: (id: string) => Promise<Invoice | null>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  isInitialized: false,
  isLoading: false,

  initialize: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ isLoading: true });

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch invoices:', error);
      set({ isLoading: false });
      return;
    }

    // Fetch items for all invoices
    const invoiceIds = (invoices || []).map((inv: Invoice) => inv.id);
    let allItems: InvoiceItem[] = [];

    if (invoiceIds.length > 0) {
      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .in('invoice_id', invoiceIds);
      allItems = items || [];
    }

    // Merge items into invoices
    const invoicesWithItems = (invoices || []).map((inv: Invoice) => ({
      ...inv,
      items: allItems.filter((item: InvoiceItem) => item.invoice_id === inv.id),
    }));

    set({
      invoices: invoicesWithItems,
      isInitialized: true,
      isLoading: false,
    });
  },

  createInvoice: async (invoiceData, items) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    set({ isLoading: true });

    // Insert the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{ ...invoiceData, user_id: user.id }])
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Failed to create invoice:', invoiceError);
      set({ isLoading: false });
      return null;
    }

    // Insert invoice items
    let savedItems: InvoiceItem[] = [];
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId)
        .select();

      if (itemsError) {
        console.error('Failed to create invoice items:', itemsError);
      }
      savedItems = insertedItems || [];
    }

    const invoiceWithItems = { ...invoice, items: savedItems };

    set((state) => ({
      invoices: [invoiceWithItems, ...state.invoices],
      isLoading: false,
    }));

    return invoice.id;
  },

  updateInvoiceStatus: async (id, status) => {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update invoice status:', error);
      return;
    }

    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...invoice } : inv
      ),
    }));
  },

  deleteInvoice: async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
      }));
    }
  },

  getNextInvoiceNumber: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'INV-0001';

    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'INV-0001';

    const lastNum = data[0].invoice_number;
    const match = lastNum.match(/INV-(\d+)/);
    if (!match) return 'INV-0001';

    const next = parseInt(match[1], 10) + 1;
    return `INV-${String(next).padStart(4, '0')}`;
  },

  getInvoiceWithItems: async (id) => {
    // Check if already loaded in store
    const existing = get().invoices.find((inv) => inv.id === id);
    if (existing && existing.items && existing.items.length > 0) {
      return existing;
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !invoice) return null;

    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);

    return { ...invoice, items: items || [] };
  },
}));
