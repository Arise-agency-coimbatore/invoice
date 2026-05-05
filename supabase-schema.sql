-- ============================================================
-- AriseOS Invoice Module — Database Schema Extension
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. Create Invoices Table
CREATE TABLE public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_name text not null,
  client_email text,
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date,
  status text check (status in ('Pending', 'Paid', 'Overdue')) default 'Pending',
  subtotal numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Invoice Items Table
CREATE TABLE public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  name text not null,
  quantity numeric default 1,
  price numeric default 0,
  total numeric default 0
);

-- 3. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Invoices
CREATE POLICY "Users can only view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for Invoice Items (via parent invoice ownership)
CREATE POLICY "Users can view their own invoice items"
  ON public.invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invoice items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoice items"
  ON public.invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoice items"
  ON public.invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- 6. Enable Realtime
ALTER publication supabase_realtime ADD TABLE public.invoices;
ALTER publication supabase_realtime ADD TABLE public.invoice_items;
