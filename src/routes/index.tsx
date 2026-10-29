import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Minus, Moon, Plus, Search, ShoppingBag, Trash2, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CATEGORIES, productsQuery, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/checkout-rules";
import { CheckoutDialog } from "@/components/store/CheckoutDialog";
import { getWhatsAppSupportUrl } from "@/config/constants";
import hero from "@/assets/hero.jpg";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sunshine Moon — Autocuidado botânico artesanal" },
      { name: "description", content: "Sabonetes artesanais, escalda-pés e águas de lençol para rituais de autocuidado botânico." },
      { property: "og:title", content: "Sunshine Moon — Autocuidado botânico artesanal" },
      { property: "og:description", content: "Sabonetes artesanais, escalda-pés e águas de lençol para rituais de autocuidado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const cart = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [cat, setCat] = useState<string>("todos");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = p.get("pedido");
    if (n && p.get("status") === "sucesso") { cart.clear(); toast.success(`Pedido #${n} confirmado! Obrigada pela compra.`); }
    if (n && p.get("status") === "cancelado") toast.error(`Pagamento do pedido #${n} cancelado.`);
    if (n) window.history.replaceState({}, "", "/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => (cat === "todos" || p.category === cat) &&
      (!term || `${p.name} ${p.sensory_notes}`.toLowerCase().includes(term)));
  }, [products, cat, q]);

  const add = (p: Product) => {
    cart.add({
      product_id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      weight_grams: p.weight_grams,
      package_width_cm: p.package_width_cm,
      package_height_cm: p.package_height_cm,
      package_depth_cm: p.package_depth_cm,
    });
    toast.success(`${p.name} adicionado ao carrinho`);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Sunshine Moon" className="h-9 w-auto object-contain mix-blend-multiply" />
          </a>
          <div className="relative ml-auto hidden w-64 sm:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar aromas…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            {/* Ícone Minha Conta */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate({ to: user ? "/minha-conta" : "/login" })}
              title={user ? "Minha Conta" : "Entrar / Cadastrar"}
              aria-label="Minha Conta"
              className="text-muted-foreground hover:text-foreground"
            >
              <User className="h-4 w-4" />
            </Button>

            {/* Ícone Painel Lojista Admin (Visível se Admin ou para acesso do lojista) */}
            <Button
              variant={isAdmin ? "secondary" : "outline"}
              size="icon"
              onClick={() => navigate({ to: "/admin" })}
              title="Painel do Lojista (Admin)"
              aria-label="Painel Administrativo"
              className={isAdmin ? "border-primary/50 text-primary" : "text-muted-foreground hover:text-foreground"}
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>

            {/* Ícone do Carrinho */}
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => cart.setOpen(true)}
              aria-label="Abrir carrinho"
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-accent-foreground">
                  {cart.count}
                </span>
              )}
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <img src={hero} alt="Sabonetes artesanais com lavanda e camomila" width={1600} height={912} className="h-[420px] w-full object-cover md:h-[520px]" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-4">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Autocuidado botânico</p>
          <h1 className="mt-3 max-w-md text-5xl leading-tight md:text-6xl">Rituais feitos à mão, sob a luz da lua</h1>
          <p className="mt-4 max-w-sm text-muted-foreground">Sabonetes, escalda-pés e brumas com ervas, flores e intenção.</p>
          <Button size="lg" className="mt-6 w-fit" onClick={() => document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" })}>Conhecer a coleção</Button>
        </div>
      </section>

      <main id="vitrine" className="mx-auto max-w-6xl px-4 py-14">
        <div className="relative mb-6 sm:hidden">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar aromas…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <h2 className="mb-8 text-4xl">Nossa coleção</h2>
        {list.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft">
                <button onClick={() => setDetail(p)} className="overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                </button>
                <div className="flex flex-1 flex-col p-5">
                  <button onClick={() => setDetail(p)} className="text-left font-display text-2xl leading-tight hover:text-primary">{p.name}</button>
                  <p className="mt-1 text-sm italic text-muted-foreground">{p.sensory_notes}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-semibold">{formatBRL(p.price)}</span>
                    <Button size="sm" onClick={() => add(p)}>Adicionar ao Carrinho</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex flex-col items-center justify-center gap-2">
          <img src={logo} alt="Sunshine Moon" className="h-7 w-auto opacity-80 mix-blend-multiply" />
          <p>© {new Date().getFullYear()} Sunshine Moon · Feito à mão com intenção</p>
        </div>
      </footer>

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <img src={detail.image} alt={detail.name} className="-mx-6 -mt-6 mb-4 aspect-square w-[calc(100%+3rem)] max-w-none object-cover" />
              <SheetHeader className="p-0">
                <SheetTitle className="font-display text-3xl">{detail.name}</SheetTitle>
                <SheetDescription>{detail.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-5 text-sm">
                <div><h3 className="text-lg">Notas de aromaterapia</h3><p className="italic text-muted-foreground">{detail.sensory_notes}</p></div>
                <div><h3 className="text-lg">Benefícios</h3>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">{detail.benefits.map((b) => <li key={b}>{b}</li>)}</ul></div>
                <div><h3 className="text-lg">Especificações</h3>
                  <p className="text-muted-foreground">Peso: {detail.weight_grams} g · Embalagem: {detail.package_width_cm}×{detail.package_height_cm}×{detail.package_depth_cm} cm</p></div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-xl font-semibold">{formatBRL(detail.price)}</span>
                  <Button onClick={() => { add(detail); setDetail(null); }}>Adicionar ao Carrinho</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={cart.open} onOpenChange={cart.setOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="p-0"><SheetTitle className="font-display text-3xl">Seu carrinho</SheetTitle><SheetDescription>{cart.count} {cart.count === 1 ? "item" : "itens"}</SheetDescription></SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {cart.items.length === 0 && <p className="py-10 text-center text-muted-foreground">Seu carrinho está vazio.</p>}
            {cart.items.map((i) => (
              <div key={i.product_id} className="flex gap-3">
                <img src={i.image} alt={i.name} className="h-16 w-16 rounded-md object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{i.name}</p>
                  <p className="text-sm text-muted-foreground">{formatBRL(i.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => cart.setQty(i.product_id, i.quantity - 1)} aria-label="Diminuir"><Minus className="h-3 w-3" /></Button>
                    <span className="w-6 text-center text-sm">{i.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => cart.setQty(i.product_id, i.quantity + 1)} aria-label="Aumentar"><Plus className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={() => cart.setQty(i.product_id, 0)} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="mb-3 flex justify-between font-semibold"><span>Subtotal</span><span>{formatBRL(cart.subtotal)}</span></div>
            <Button className="w-full" size="lg" disabled={cart.items.length === 0} onClick={() => { cart.setOpen(false); setCheckout(true); }}>Calcular frete e finalizar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkout} onOpenChange={setCheckout} />

      <a href={getWhatsAppSupportUrl()} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-soft transition hover:scale-110">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.43 9.43 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.28 11.28 0 0 0 12.05.7C5.8.7.7 5.8.7 12.04c0 2 .52 3.95 1.52 5.67L.6 23.3l5.73-1.5a11.3 11.3 0 0 0 5.72 1.46c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" /></svg>
      </a>
    </div>
  );
}
