import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  detail: string;
  price: number;
  image: string;
  sizes: string[];
};

type CartItem = Product & { size: string; quantity: number };

const products: Product[] = [
  { id: 1, name: "Calça Ágora", detail: "Linho misto · Areia", price: 389, image: "/images/calca-linho.jpg", sizes: ["38", "40", "42", "44"] },
  { id: 2, name: "Jaqueta Atlas", detail: "Modelagem alfaiatada · Oliva", price: 549, image: "/images/hero-jacket.jpg", sizes: ["P", "M", "G", "GG"] },
  { id: 3, name: "Calça Ágora Natural", detail: "Linho misto · Natural", price: 389, image: "/images/calca-fold.jpg", sizes: ["38", "40", "42", "44"] },
];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function BagIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" /></svg>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("atticus-cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch { window.localStorage.removeItem("atticus-cart"); }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("atticus-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, menuOpen]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const freeShippingMissing = Math.max(0, 700 - subtotal);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2300);
  }

  function addToCart(product: Product) {
    const size = selectedSizes[product.id] || product.sizes[0];
    setCart((current) => {
      const match = current.find((item) => item.id === product.id && item.size === size);
      if (match) return current.map((item) => item === match ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, size, quantity: 1 }];
    });
    notify(`${product.name} foi adicionada à sacola`);
    setCartOpen(true);
  }

  function changeQuantity(id: number, size: string, direction: number) {
    setCart((current) =>
      current
        .map((item) => item.id === id && item.size === size ? { ...item, quantity: item.quantity + direction } : item)
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id: number, size: string) {
    setCart((current) => current.filter((item) => !(item.id === id && item.size === size)));
  }

  return (
    <main>
      <div className="announcement"><span>Envio para todo o Brasil</span><i /><span>Primeiro drop disponível</span><i /><span>Compra segura</span></div>
      <header className="site-header">
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" aria-expanded={menuOpen}><span /><span /></button>
        <a className="wordmark" href="#inicio" aria-label="Atticus Atelier">ATT<span>I</span>CUS<small>ATELIER</small></a>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Navegação principal">
          <a href="#novidades" onClick={() => setMenuOpen(false)}>Novidades</a>
          <a href="#colecao" onClick={() => setMenuOpen(false)}>Drop 01</a>
          <a href="#alfaiataria" onClick={() => setMenuOpen(false)}>Alfaiataria</a>
          <a href="#manifesto" onClick={() => setMenuOpen(false)}>Manifesto</a>
        </nav>
        <button className="bag" onClick={() => setCartOpen(true)} aria-label={`Abrir sacola com ${itemCount} itens`}>
          <BagIcon /><span>{itemCount}</span>
        </button>
      </header>

      <section className="hero" id="inicio">
        <img src="/images/hero-jacket.jpg" alt="Jaqueta verde oliva da coleção Atticus" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p>Atticus Atelier · Drop 01</p>
          <h1>Identidade não<br />se copia. <em>Se vive.</em></h1>
          <p className="hero-description">Alfaiataria contemporânea para quem transforma presença em linguagem.</p>
          <a className="outline-button" href="#colecao">Conheça a coleção</a>
        </div>
        <div className="hero-index"><span>01</span><b /><span>03</span></div>
      </section>

      <section className="intro" id="novidades">
        <p className="eyebrow">O primeiro capítulo</p>
        <h2>Clássicos sem tempo.<br /><em>Presença sem esforço.</em></h2>
        <p className="intro-text">Peças com cortes precisos, matérias naturais e detalhes que revelam cuidado. Criadas para atravessar ocasiões e permanecer no guarda-roupa.</p>
      </section>

      <section className="collection" id="colecao">
        <div className="section-heading"><div><p className="eyebrow">Drop 01</p><h2>Essenciais Atticus</h2></div><a href="#colecao">Ver coleção</a></div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product" key={product.id}>
              <div className="product-image"><img src={product.image} alt={product.name} /><span className="number">0{index + 1}</span></div>
              <div className="product-info"><div><h3>{product.name}</h3><p>{product.detail}</p></div><strong>{money(product.price)}</strong></div>
              <div className="product-actions">
                <label><span>Tamanho</span>
                  <select value={selectedSizes[product.id] || product.sizes[0]} onChange={(event) => setSelectedSizes({ ...selectedSizes, [product.id]: event.target.value })} aria-label={`Tamanho de ${product.name}`}>
                    {product.sizes.map((size) => <option value={size} key={size}>{size}</option>)}
                  </select>
                </label>
                <button onClick={() => addToCart(product)}>Adicionar à sacola</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial" id="alfaiataria">
        <div className="editorial-image"><img src="/images/jaqueta-forro.jpg" alt="Detalhes internos da Jaqueta Atlas" /></div>
        <div className="editorial-copy"><p className="eyebrow">Feito nos detalhes</p><h2>A forma encontra<br /><em>o movimento.</em></h2><p>Modelagens despojadas, referências da alfaiataria e acabamento pensado para acompanhar o corpo. Elegância, conforto e versatilidade em equilíbrio.</p><a className="text-link" href="#colecao">Descobrir as peças <span>→</span></a></div>
      </section>

      <section className="manifesto" id="manifesto">
        <p className="eyebrow">Manifesto Atticus</p><blockquote>“Visto por todos.<br /><em>Vivido por você.</em>”</blockquote>
        <a className="outline-button dark" href="https://instagram.com/atticus.atelier" target="_blank" rel="noreferrer">Siga @atticus.atelier</a>
      </section>

      <footer>
        <a className="wordmark footer-mark" href="#inicio">ATT<span>I</span>CUS<small>ATELIER</small></a>
        <p>Alfaiataria contemporânea.<br />São Paulo, Brasil.</p>
        <div><a href="#colecao">Coleção</a><a href="#manifesto">Sobre</a><a href="https://instagram.com/atticus.atelier">Instagram</a></div>
        <small>© 2026 Atticus Atelier</small>
      </footer>

      <div className={cartOpen ? "cart-backdrop visible" : "cart-backdrop"} onClick={() => setCartOpen(false)} />
      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"} aria-hidden={!cartOpen} aria-label="Sacola de compras">
        <div className="cart-header">
          <div><p className="eyebrow">Sua seleção</p><h2>Sacola <span>({itemCount})</span></h2></div>
          <button onClick={() => setCartOpen(false)} aria-label="Fechar sacola"><CloseIcon /></button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart"><BagIcon /><h3>Sua sacola está vazia</h3><p>Descubra o primeiro drop da Atticus.</p><button onClick={() => setCartOpen(false)}>Explorar coleção</button></div>
        ) : (
          <>
            <div className="shipping-message">
              {freeShippingMissing > 0 ? <p>Faltam <strong>{money(freeShippingMissing)}</strong> para o frete grátis</p> : <p><strong>Você ganhou frete grátis</strong></p>}
              <div><span style={{ width: `${Math.min(100, subtotal / 7)}%` }} /></div>
            </div>
            <div className="cart-items">
              {cart.map((item) => (
                <article className="cart-item" key={`${item.id}-${item.size}`}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-copy">
                    <div><h3>{item.name}</h3><p>{item.detail}</p><p>Tamanho: {item.size}</p></div>
                    <div className="cart-item-bottom">
                      <div className="quantity"><button onClick={() => changeQuantity(item.id, item.size, -1)} aria-label="Diminuir quantidade">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, item.size, 1)} aria-label="Aumentar quantidade">+</button></div>
                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                    <button className="remove" onClick={() => removeItem(item.id, item.size)}>Remover</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <p>Frete e descontos calculados na próxima etapa.</p>
              <button onClick={() => notify("O checkout com pagamento será conectado na próxima etapa")}>Ir para o pagamento</button>
              <div className="payment-badges"><span>PIX</span><span>VISA</span><span>MASTER</span><span>BOLETO</span></div>
            </div>
          </>
        )}
      </aside>
      <div className={toast ? "toast show" : "toast"} role="status">{toast}</div>
    </main>
  );
}
