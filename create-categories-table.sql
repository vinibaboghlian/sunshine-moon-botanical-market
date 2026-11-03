-- 1. Criar tabela de categorias se não existir
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Conceder permissões para a tabela de categorias
GRANT ALL ON public.categories TO anon, authenticated, service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access categories" ON public.categories;
CREATE POLICY "Public full access categories" ON public.categories FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Inserir as categorias padrão caso não existam
INSERT INTO public.categories (id, label)
VALUES 
  ('sabonetes', 'Sabonetes'),
  ('escalda_pes', 'Escalda-pés'),
  ('home_spray', 'Água de lençol'),
  ('kits', 'Kits')
ON CONFLICT (id) DO NOTHING;

-- 4. Remover a restrição fixa CHECK de categoria na tabela products para permitir categorias dinâmicas
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

