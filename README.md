# 🌿 Sunshine Moon — Botanical Market

> Plataforma de e-commerce sensorial e ecossistema operacional para cosmética botânica, rituais de bem-estar e aromaterapia artesanal.

🔗 **Aplicação Publicada:** [https://sunshine-moon-botanical-market.lovable.app](https://sunshine-moon-botanical-market.lovable.app)  
📦 **Repositório Oficial:** [https://github.com/vinibaboghlian/sunshine-moon-botanical-market](https://github.com/vinibaboghlian/sunshine-moon-botanical-market)

---

## 1. A Dor Escolhida e Por Que Vale um Negócio

### O Problema Real
O mercado de cosmética artesanal e aromaterapia no Brasil enfrenta dois gargalos críticos:
1. **Para o Consumidor:** A compra online de produtos de bem-estar costuma ser fria e genérica. O cliente não quer apenas comprar um "sabonete", ele busca alívio para estresse, insônia, hidratação para peles sensíveis ou purificação energética para o lar. A ausência de um guia sensorial e de clareza terapêutica gera alto abandono de carrinho.
2. **Para a Empreendedora Artesanal:** A gestão de vendas fragmentada em conversas informais de WhatsApp, anotações de caderno e falta de integração logística resultam em perda de pedidos, erros no cálculo de frete por cubagem e dificuldade de escalar a produção sem perder a proximidade com o cliente.

### Por Que Vale um Negócio?
Marcas botânicas autorais possuem margens brutas atrativas (frequentemente superiores a 60%), mas sofrem com o atrito de checkout e a falta de profissionalização operacional. Ao transformar um catálogo passivo em uma experiência transacional com controle de pedidos em tempo real, a Sunshine Moon une a conveniência do e-commerce moderno ao toque humano e acolhedor do produto artesanal.

---

## 2. Tamanho de Mercado e Business Model Canvas

### 📊 Oportunidade de Mercado (TAM, SAM, SOM)
* **TAM (Total Addressable Market):** Mercado brasileiro de Higiene Pessoal, Perfumaria e Cosméticos (HPPC) — movimentou mais de R$ 150 bilhões em 2024 (ABIHPEC), sendo o Brasil um dos quatro maiores mercados consumidores do mundo.
* **SAM (Serviceable Addressable Market):** Nicho de cosméticos naturais, veganos, botânicos e aromaterapia no Brasil — estimado em mais de R$ 4,5 bilhões anuais, com taxa de crescimento anual composta (CAGR) superior a 12%.
* **SOM (Serviceable Obtainable Market):** Mercado regional do Sudeste e Grande São Paulo focado em autocuidado, presentes corporativos e autoconsumo consciente — meta inicial de captura de R$ 180 mil a R$ 240 mil no primeiro ano de operação digital.

---

### 📋 Business Model Canvas

| Bloco | Definição no Sunshine Moon Market |
|---|---|
| **Proposta de Valor** | Rituais botânicos e aromaterapia autoral de alta performance que transformam a rotina em momentos de bem-estar e conexão, com entrega rápida e experiência visual sensorial. |
| **Segmento de Clientes** | Mulheres e homens (25-50 anos) urbanos em busca de rituais contra estresse, adeptos do consumo consciente, presentes afetivos e produtos livres de crueldade animal. |
| **Canais** | Loja Web PWA (Lovable), suporte humanizado via WhatsApp, perfil no Instagram e envios estruturados via transportadoras (Melhor Envio / Correios). |
| **Relacionamento** | Experiência de compra empática, transparência de fórmulas/benefícios, acompanhamento do pedido em tempo real pelo cliente e pós-venda via WhatsApp. |
| **Fontes de Receita** | Venda direta B2C de produtos individuais (sabonetes glicerinados, escalda-pés, home sprays), kits de presente personalizados ("Monte seu Ritual") e frete calculado. |
| **Recursos-Chave** | Fórmulas proprietárias naturais, plataforma web transacional (Lovable + Supabase), identidade de marca botânica e estoque centralizado de matérias-primas. |
| **Atividades-Chave** | Produção artesanal, curadoria de matérias-primas, marketing de conteúdo, controle logístico de expedição e gestão do Kanban de pedidos. |
| **Parcerias-Chave** | Fornecedores de bases glicerinadas e extratos vegetais, Stripe (gateway de pagamentos), Melhor Envio (despacho logístico) e Supabase (infraestrutura backend). |
| **Estrutura de Custos** | Insumos e embalagens ecológicas, taxas de processamento de pagamento (Stripe), custos de embalagem/etiquetagem, marketing digital e infraestrutura de software. |

---

## 3. A Tese do MVP e o Que Ficou Manual de Propósito

### A Tese Central
> *"Clientes de cosméticos botânicos artesanais convertem com maior taxa e ticket médio quando a vitrine digital contextualiza as notas sensoriais e os benefícios emocionais de cada fórmula, desde que o processo de preenchimento de endereço e checkout seja simplificado e transparente."*

### O Que Foi Automatizado no MVP:
* **Catálogo Sensorial Dinâmico:** Produtos carregados com especificações de aromaterapia, notas de topo/corpo, benefícios terapêuticos e cubagem física.
* **Autopreenchimento de Endereço via CEP:** Integração com a API do ViaCEP para preencher rua, bairro, cidade e estado em milissegundos, evitando desistências.
* **Registro Relacional Seguro:** Persistência imediata de pedidos e itens no Supabase com isolamento de dados via Row Level Security (RLS).
* **Checkout com Stripe:** Estrutura pronta para geração de sessão segura e conciliação de pagamentos.
* **Painel Operacional Kanban:** Interface visual administrativa no estilo Trello para arrastar cards de pedidos entre as etapas de produção e expedição.
* **Área do Cliente:** Acompanhamento do ciclo de vida da compra com timeline de status em tempo real.

### O Que Ficou Manual de Propósito (Decisões Estratégicas):
1. **Embalagem e Criação da Etiqueta no Melhor Envio:** A cotação e validação do peso ocorrem de forma estruturada no app, mas a emissão final da etiqueta física no Melhor Envio é disparada manualmente pela lojista após conferência física dos produtos. Isso reduz o custo de cancelamento de frete em caso de alteração no pedido.
2. **Suporte de Dúvidas Personalizadas:** Em vez de um chatbot invasivo, optou-se por um botão flutuante que conecta diretamente ao WhatsApp da fundadora com mensagem contextualizada, preservando a intimidade e o acolhimento da marca artesanal.
3. **Notificação de Rastreio:** O código de rastreamento é inserido pela lojista no card do Kanban ao despachar a encomenda, atualizando a timeline na Área do Cliente automaticamente.

---

## 4. O Mega Prompt e as Correções Posteriores

O projeto foi construído no **Lovable** utilizando a metodologia de divisão por escopos fundamentada no padrão CAFÉ (Contexto, Ação, Formato e Exemplos).

### 📝 O Mega Prompt Inicial (Fundação e E-commerce)

```markdown
### CONTEXTO
Você é um desenvolvedor full-stack sênior criando uma aplicação de e-commerce transacional chamada "Sunshine Moon", voltada para sabonetes artesanais, águas de lençol, escalda-pés e itens de autocuidado botânico. A aplicação deve ser esteticamente refinada (minimalista, tons de linho, verde sálvia, terracota suave e toques dourados) e tecnicamente robusta, preparando o terreno para pagamentos via Stripe e sincronização logística com Melhor Envio.

### AÇÃO
Construa a aplicação em React, TypeScript, Tailwind CSS e integre com o Supabase.

1. MODELAGEM DE DADOS (SUPABASE):
   - Tabela `products`: id (uuid, pk), name (text), category (text), price (numeric), description (text), sensory_notes (text), benefits (text[]), image_url (text), stock_quantity (int4), is_active (boolean), weight_grams (int4), package_width_cm (numeric), package_height_cm (numeric), package_depth_cm (numeric), created_at (timestamptz).
   - Tabela `orders`: id (uuid, pk), order_number (text), customer_name (text), customer_email (text), customer_phone (text - 11 dígitos), customer_cpf (text - 11 dígitos), postal_code (text), street (text), number (text), complement (text), neighborhood (text), city (text), state (text - UF 2 dígitos), subtotal (numeric), shipping_cost (numeric), total (numeric), payment_status (text), status (text), tracking_code (text), created_at (timestamptz).
   - Tabela `order_items`: id (uuid, pk), order_id (uuid, fk), product_id (uuid, fk), quantity (int4), unit_price (numeric).
   - RLS configurado: leitura pública de produtos ativos e inserção controlada de pedidos.

2. VITRINE SENSORIAL (STOREFRONT):
   - Header com logo Sunshine Moon, categorias filtráveis, busca e drawer de carrinho com badge reativa.
   - Hero banner acolhedor focado em rituais diários de conexão.
   - Cards com notas aromáticas, benefícios e peso unitário.

3. LOGÍSTICA & CHECKOUT:
   - Validação estrita de CEP via API pública do ViaCEP com autopreenchimento de endereço.
   - Validações de máscara para celular (11 dígitos) e CPF (11 dígitos).
   - Integração com Stripe Checkout e gravação prévia de pedido com status pendente.
   - Botão flutuante de suporte via WhatsApp com mensagem personalizada.
