-- Habilitar permissão completa de leitura, inserção, atualização e exclusão na tabela products
GRANT ALL ON public.products TO anon, authenticated, service_role;

-- Remover políticas restritivas anteriores se existirem
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow all for anon and auth" ON public.products;

-- Criar política permissiva para leitura (vitrine e admin)
CREATE POLICY "Allow public select on products" 
ON public.products 
FOR SELECT 
TO public 
USING (true);

-- Criar política permissiva para inserção, edição e exclusão de produtos
CREATE POLICY "Allow full product management" 
ON public.products 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Garantir o mesmo para profiles e orders caso necessário
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public full access profiles" ON public.profiles;
CREATE POLICY "Public full access profiles" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

GRANT ALL ON public.orders TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public full access orders" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

GRANT ALL ON public.order_items TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Public full access order_items" ON public.order_items FOR ALL TO public USING (true) WITH CHECK (true);

