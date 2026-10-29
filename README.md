# 🌿 Sunshine Moon — Botanical Market

> Plataforma de e-commerce transacional e ecossistema de bem-estar botânico com catálogo sensorial, checkout integrado via Stripe, inteligência logística e painel operacional com Kanban.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Sobre o Projeto

O **Sunshine Moon Botanical Market** é uma solução completa para marcas artesanais de aromaterapia, sabonetes botânicos, escalda-pés e águas de lençol. O projeto foi desenhado sob uma identidade visual minimalista e acolhedora (paleta com tons de linho, verde sálvia, terracota suave e toques dourados), unindo uma experiência de compra imersiva a uma esteira operacional robusta.

O desenvolvimento seguiu a metodologia de **Vibe Coding & Refinamento Profissional**:
1. **Scaffolding e Prototipagem Ágil:** Estruturação visual e modelagem inicial de componentes no **Lovable**.
2. **Engenharia e Refino Cirúrgico:** Implementação de regras de negócio, integrações transacionais seguras e arquitetura de componentes locais via **Lovable**.

---

## 🚀 Funcionalidades Principais

### 🛍️ Storefront Sensorial
- **Vitrine Botânica:** Catálogo de produtos com notas aromáticas, benefícios terapêuticos e especificações físicas.
- **Gaveta de Carrinho Reativa:** Gerenciamento de quantidades, cálculo dinâmico de subtotal e preservação de estado.
- **Suporte Centralizado:** Botão flutuante integrado ao WhatsApp com mensagem contextualizada para atendimento em tempo real.

### 📦 Logística & Dados Estruturados
- **Preenchimento Inteligente via CEP:** Consulta assíncrona à API do **ViaCEP** com preenchimento automático de logradouro, bairro, cidade e UF.
- **Validação Cadastral Estrita:** Campos validados para Telefone (11 dígitos com DDD) e CPF (11 dígitos numéricos, essencial para emissão de nota fiscal e etiquetas de despacho).
- **Prontidão Logística (Melhor Envio):** Catálogo modelado com dados de cubagem (`package_width_cm`, `package_height_cm`, `package_depth_cm`) e peso bruto (`weight_grams`) para integração com transportadoras.

### 💳 Checkout Transacional
- **Pagamentos via Stripe:** Fluxo preparado para geração de `Checkout Session`, com amarração de metadados (`order_id`) e transições de status via Webhooks.
- **Persistência Relacional:** Gravação imediata do pedido e de seus itens no banco relacional antes do despacho para o gateway, eliminando abandono fantasma.

### 📋 Painel Administrativo Operacional (`/admin`)
- **Kanban Estilo Trello:** Gerenciamento visual do ciclo de vida dos pedidos em 5 etapas:
  - `Novos Pedidos` ➔ `Em Preparo` ➔ `Enviados` ➔ `Concluídos` ➔ `Cancelados`
- **Gestão de Rastreio:** Modal detalhado com inserção de código de rastreamento e transportadora.
- **Visão de Estoque:** Controle de disponibilidade de produtos em tempo real.

### 👤 Área do Cliente (`/minha-conta`)
- **Timeline de Rastreamento:** Visualização clara do progresso da compra pelo cliente (`Confirmado` ➔ `Em Preparo` ➔ `Em Trânsito` ➔ `Entregue`).
- **Histórico e Dados Pessoais:** Gestão de endereços de entrega e canais rápidos para reabertura de suporte.

---

## 🛠️ Stack Tecnológica

| Camada | Ferramenta / Biblioteca |
|---|---|
| **Framework Web** | React com TypeScript e Vite |
| **Estilização** | Tailwind CSS e Shadcn UI / Radix UI |
| **Ícones** | Lucide React |
| **Backend / DB** | Supabase (PostgreSQL, Auth e RLS) |
| **Pagamentos** | Stripe (API & Checkout Sessions) |
| **Logística** | ViaCEP API + Modelagem para Melhor Envio |
| **Controle de Estado** | React Context API + TanStack Query |

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : referenced_in

    PROFILES {
        uuid id PK
        uuid user_id FK
        text role "admin | customer"
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        text name
        text category
        numeric price
        text sensory_notes
        text[] benefits
        int4 weight_grams
        numeric package_width_cm
        numeric package_height_cm
        numeric package_depth_cm
        int4 stock_quantity
        boolean is_active
    }

    ORDERS {
        uuid id PK
        text order_number
        uuid user_id FK
        text customer_name
        text customer_email
        text customer_phone
        text customer_cpf
        text postal_code
        text street
        text number
        text complement
        text neighborhood
        text city
        text state
        numeric subtotal
        numeric shipping_cost
        numeric total
        text payment_status
        text stripe_session_id
        text status
        text tracking_code
        timestamptz created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int4 quantity
        numeric unit_price
    }
