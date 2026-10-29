-- Criação da tabela de perfis de usuário com RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  full_name text,
  phone text,
  cpf text,
  postal_code text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilita RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários leem e editam apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Admins têm acesso total a perfis
CREATE POLICY "Admins full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Atualiza tabela orders com user_id, tracking_code e shipping_carrier se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tracking_code') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_carrier') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_carrier text DEFAULT 'Correios';
  END IF;
END $$;

-- RLS de orders: Cliente lê seus próprios pedidos, Admins lêem e editam todos
CREATE POLICY "Customers can view their orders" ON public.orders
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins full access to orders" ON public.orders
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS de order_items
CREATE POLICY "Customers can view their order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Admins full access to order items" ON public.order_items
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

