CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('sabonetes','escalda_pes','home_spray','kits')),
  price numeric(10,2) NOT NULL,
  description text,
  sensory_notes text,
  benefits text[] NOT NULL DEFAULT '{}',
  image_url text,
  stock_quantity int4 NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  weight_grams int4 NOT NULL,
  package_width_cm numeric NOT NULL,
  package_height_cm numeric NOT NULL,
  package_depth_cm numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL CHECK (customer_phone ~ '^[0-9]{11}$'),
  customer_cpf text NOT NULL CHECK (customer_cpf ~ '^[0-9]{11}$'),
  postal_code text NOT NULL CHECK (postal_code ~ '^[0-9]{8}$'),
  street text NOT NULL, number text NOT NULL, complement text,
  neighborhood text NOT NULL, city text NOT NULL,
  state text NOT NULL CHECK (state ~ '^[A-Z]{2}$'),
  subtotal numeric(10,2) NOT NULL, shipping_cost numeric(10,2) NOT NULL,
  shipping_method text NOT NULL, total numeric(10,2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'pendente' CHECK (payment_status IN ('pendente','pago','cancelado')),
  stripe_session_id text,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_preparo','enviado','concluido')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int4 NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL
);
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

INSERT INTO public.products (slug,name,category,price,description,sensory_notes,benefits,stock_quantity,weight_grams,package_width_cm,package_height_cm,package_depth_cm) VALUES
('acalanto-lunar','Sabonete Acalanto Lunar','sabonetes',24.00,'Sabonete artesanal de mel e camomila para rituais noturnos de desaceleração.','Mel dourado, camomila, leve baunilha',ARRAY['Acalma a pele sensível','Induz relaxamento antes de dormir','Hidratação suave'],40,120,8,6,3),
('purificacao-eterica','Sabonete Purificação Etérica','sabonetes',26.00,'Sal grosso e Trussardi para limpeza energética e frescor profundo.','Sal marinho, notas amadeiradas, cítrico fresco',ARRAY['Limpeza energética','Esfoliação delicada','Sensação de renovação'],35,130,8,6,3),
('fartura-realizacao','Sabonete Fartura e Realização','sabonetes',25.00,'Amora e romã para despertar abundância e vitalidade.','Amora silvestre, romã, frutas vermelhas',ARRAY['Rico em antioxidantes','Perfume frutado duradouro','Pele macia e luminosa'],40,120,8,6,3),
('escalda-lavanda','Escalda-Pés Despertar Energético — Lavanda','escalda_pes',32.00,'Blend de sais e flores de lavanda para aliviar o cansaço do dia.','Lavanda, sálvia, flores secas',ARRAY['Alivia pés cansados','Relaxamento profundo','Melhora a qualidade do sono'],25,250,10,10,6),
('escalda-cafe','Escalda-Pés Despertar Energético — Café','escalda_pes',32.00,'Sais com café moído para revigorar e ativar a circulação.','Café torrado, canela, cacau',ARRAY['Ativa a circulação','Revigora o corpo','Esfoliação natural'],25,250,10,10,6),
('brisa-lunar','Água de Lençol Brisa Lunar','home_spray',38.00,'Bruma botânica para lençóis e travesseiros, criando um refúgio de calma.','Lavanda, algodão limpo, flor de laranjeira',ARRAY['Perfuma tecidos','Ambiente acolhedor','Ritual de sono tranquilo'],30,300,18,5,5);