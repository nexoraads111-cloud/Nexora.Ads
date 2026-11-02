'use client';

import { useMemo, useState } from 'react';

const PC_PRODUCTS = [
  {
    id: 'rtx4070',
    cat: 'GPU',
    name: 'GeForce RTX 4070 Super',
    price: 649,
    tag: 'Best seller',
    img: '/Public/Image/demo/rtx4070.png',
    short: '1440p gaming powerhouse with DLSS 3.',
    desc: 'Ada Lovelace GPU with 12GB GDDR6X. Excellent for high-refresh 1440p, creative work and ray tracing. Demo price only.',
    specs: ['12GB GDDR6X', 'DLSS 3', 'Ray Tracing', '3× DisplayPort'],
  },
  {
    id: 'rx7800',
    cat: 'GPU',
    name: 'Radeon RX 7800 XT',
    price: 519,
    tag: 'Value',
    img: '/Public/Image/demo/rx7800.png',
    short: 'Strong rasterization for the money.',
    desc: '16GB VRAM and excellent raster performance for gaming builds. Demo example product.',
    specs: ['16GB GDDR6', 'RDNA 3', 'AV1 encode', '3 fans'],
  },
  {
    id: 'ryzen7',
    cat: 'CPU',
    name: 'AMD Ryzen 7 7800X3D',
    price: 369,
    tag: 'Gaming',
    img: '/Public/Image/demo/ryzen7.png',
    short: 'Cache monster for FPS.',
    desc: '8 cores / 16 threads with 3D V-Cache. Great for competitive and AAA gaming. Demo price.',
    specs: ['8C/16T', 'AM5', '105W TDP', 'DDR5'],
  },
  {
    id: 'i5',
    cat: 'CPU',
    name: 'Intel Core i5-14600K',
    price: 299,
    tag: '',
    img: '/Public/Image/demo/i5.png',
    short: 'Balanced productivity CPU.',
    desc: 'Hybrid architecture for gaming + content work. Demo example listing.',
    specs: ['14 cores', 'LGA1700', 'Unlocked', 'DDR5/DDR4'],
  },
  {
    id: 'ram32',
    cat: 'RAM',
    name: '32GB DDR5-6000 Kit',
    price: 119,
    tag: '',
    img: '/Public/Image/demo/ram32.png',
    short: 'Fast dual-channel kit.',
    desc: '2×16GB DDR5-6000 CL30 style kit for modern platforms. Demo price.',
    specs: ['2×16GB', '6000 MT/s', 'RGB optional', 'XMP/EXPO'],
  },
  {
    id: 'ssd2tb',
    cat: 'SSD',
    name: '2TB NVMe Gen4 SSD',
    price: 149,
    tag: 'Fast',
    img: '/Public/Image/demo/ssd2tb.png',
    short: 'Roomy Gen4 drive.',
    desc: 'High-speed PCIe 4.0 NVMe for games and creative libraries. Demo example.',
    specs: ['2TB', 'PCIe 4.0', '~7000 MB/s', 'M.2 2280'],
  },
];

const PREMIUM_PRODUCTS = [
  {
    id: 'buds',
    cat: 'Audio',
    name: 'Aura Buds Pro',
    price: 129,
    img: '/Public/Image/demo/buds.png',
    short: 'Soft ANC earbuds with clear calls.',
    desc: 'Premium wireless earbuds with active noise canceling, multipoint and wireless charging case. Demo product.',
    specs: ['ANC', 'IPX4', '30h case', 'USB-C'],
  },
  {
    id: 'watch',
    cat: 'Wearables',
    name: 'Pulse Watch S',
    price: 189,
    img: '/Public/Image/demo/watch.png',
    short: 'Minimal smartwatch, all-day battery.',
    desc: 'Lightweight smartwatch with heart-rate, sleep tracking and always-on display option. Demo only.',
    specs: ['AMOLED', '5ATM', 'GPS', '7 days'],
  },
  {
    id: 'case',
    cat: 'Accessories',
    name: 'Carbon Case Mag',
    price: 39,
    img: '/Public/Image/demo/case.png',
    short: 'MagSafe-ready slim case.',
    desc: 'Textured carbon-look case with strong magnets and raised camera rim. Demo listing.',
    specs: ['MagSafe', 'Drop tested', 'Slim', 'Matte'],
  },
  {
    id: 'mic',
    cat: 'Audio',
    name: 'Studio Mic Mini',
    price: 89,
    img: '/Public/Image/demo/mic.png',
    short: 'USB mic for clean voiceovers.',
    desc: 'Compact USB condenser microphone for streaming and calls. Demo product.',
    specs: ['USB-C', 'Mute button', 'Cardioid', 'Monitor jack'],
  },
  {
    id: 'mat',
    cat: 'Accessories',
    name: 'Desk Mat XL',
    price: 49,
    img: '/Public/Image/demo/mat.png',
    short: 'Soft XL desk surface.',
    desc: 'Extended desk mat with stitched edges and smooth glide. Demo example.',
    specs: ['900×400mm', 'Stitched', 'Non-slip', 'Washable'],
  },
  {
    id: 'band',
    cat: 'Wearables',
    name: 'Link Band Steel',
    price: 59,
    img: '/Public/Image/demo/band.png',
    short: 'Steel link bracelet finish.',
    desc: 'Adjustable stainless-steel band for Pulse Watch S. Demo accessory.',
    specs: ['Stainless', 'Tool-free', '22mm', 'Silver'],
  },
];

const PIZZA_PRODUCTS = [
  {
    id: 'margherita',
    cat: 'Classic',
    name: 'Margherita',
    price: 9.5,
    img: '/Public/Image/demo/margherita.png',
    short: 'Tomato, mozzarella, basil.',
    desc: 'Wood-fired classic with San Marzano-style tomato, fresh mozzarella and basil. Demo menu item.',
    ingredients: ['Tomato', 'Mozzarella', 'Basil', 'Olive oil'],
  },
  {
    id: 'pepperoni',
    cat: 'Classic',
    name: 'Pepperoni',
    price: 11.5,
    img: '/Public/Image/demo/pepperoni.png',
    short: 'Crispy pepperoni & mozzarella.',
    desc: 'Crowd favorite with generous pepperoni and melted cheese. Demo menu item.',
    ingredients: ['Pepperoni', 'Mozzarella', 'Tomato'],
  },
  {
    id: 'truffle',
    cat: 'Premium',
    name: 'Truffle Funghi',
    price: 14.5,
    img: '/Public/Image/demo/truffle.png',
    short: 'Mushrooms & truffle oil.',
    desc: 'Earthy mushrooms finished with truffle oil and soft cheese. Demo premium pizza.',
    ingredients: ['Mushrooms', 'Truffle oil', 'Mozzarella', 'Garlic'],
  },
  {
    id: 'diavola',
    cat: 'Premium',
    name: 'Diavola Hot',
    price: 12.5,
    img: '/Public/Image/demo/diavola.png',
    short: 'Spicy salami & chili.',
    desc: 'Spicy salami with chili oil for heat lovers. Demo menu item.',
    ingredients: ['Spicy salami', 'Chili', 'Mozzarella'],
  },
  {
    id: 'garden',
    cat: 'Veggie',
    name: 'Garden Fresh',
    price: 10.5,
    img: '/Public/Image/demo/garden.png',
    short: 'Peppers, olives, onion.',
    desc: 'Colorful vegetable pizza with olive oil base. Demo veggie option.',
    ingredients: ['Peppers', 'Olives', 'Onion', 'Tomato'],
  },
  {
    id: 'fourcheese',
    cat: 'Classic',
    name: 'Four Cheese',
    price: 12,
    img: '/Public/Image/demo/fourcheese.png',
    short: 'Mozzarella, gorgonzola, parmesan.',
    desc: 'Rich cheese blend baked until golden. Demo classic.',
    ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Cream'],
  },
];

function useCart() {
  const [cart, setCart] = useState({});
  const lines = useMemo(
    () => Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty })),
    [cart]
  );
  const add = (id, n = 1) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + n }));
  const sub = (id) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) - 1) };
      if (!next[id]) delete next[id];
      return next;
    });
  const setQty = (id, qty) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const clear = () => setCart({});
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return { cart, lines, add, sub, setQty, clear, count };
}

function DemoChrome({ title, onClose, device, setDevice, theme }) {
  return (
    <div className={`demo-chrome theme-${theme}`}>
      <div className="demo-dots" aria-hidden><span /><span /><span /></div>
      <b>{title}</b>
      <div className="demo-devices">
        {['desktop', 'tablet', 'mobile'].map((d) => (
          <button key={d} type="button" className={device === d ? 'active' : ''} onClick={() => setDevice(d)}>
            {d[0].toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
      <button type="button" className="demo-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}

function StoreShell({ title, theme, device, setDevice, onClose, children }) {
  return (
    <div className={`demo-frame theme-${theme}`} data-device={device}>
      <DemoChrome title={title} onClose={onClose} device={device} setDevice={setDevice} theme={theme} />
      <div className="demo-viewport">{children}</div>
      <p className="demo-note">Interactive demo — example prices, no real checkout.</p>
    </div>
  );
}

function PcStoreDemo({ onClose }) {
  const [device, setDevice] = useState('desktop');
  const [view, setView] = useState('home'); // home | product | cart
  const [active, setActive] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('featured');
  const { lines, add, sub, clear, count } = useCart();
  const cats = ['All', 'GPU', 'CPU', 'RAM', 'SSD'];

  const items = useMemo(() => {
    let list = PC_PRODUCTS.filter(
      (p) => (cat === 'All' || p.cat === cat) && `${p.name} ${p.short}`.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === 'price') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [q, cat, sort]);

  const total = lines.reduce((s, l) => s + (PC_PRODUCTS.find((p) => p.id === l.id)?.price || 0) * l.qty, 0);
  const product = PC_PRODUCTS.find((p) => p.id === active);

  return (
    <StoreShell title="01 · PC STORE" theme="dark" device={device} setDevice={setDevice} onClose={onClose}>
      <div className="ds ds-pc">
        <header className="ds-nav">
          <button type="button" className="ds-brand" onClick={() => setView('home')}>
            NEON<span>PC</span>
          </button>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search GPUs, CPUs, RAM…" />
          <nav>
            <button type="button" className={view === 'home' ? 'on' : ''} onClick={() => setView('home')}>Catalog</button>
            <button type="button" className={view === 'cart' ? 'on' : ''} onClick={() => setView('cart')}>
              Cart ({count})
            </button>
          </nav>
        </header>

        {view === 'home' && (
          <>
            <section className="ds-hero pc">
              <div>
                <small>Demo tech store</small>
                <h2>Power for your victories</h2>
                <p>Browse PC components with product pages, filters and a working cart.</p>
                <button type="button" onClick={() => { setCat('GPU'); setView('home'); }}>Shop GPUs</button>
              </div>
              <img src="/Public/Image/PcstoreShowcase.png" alt="" />
            </section>
            <div className="ds-toolbar">
              {cats.map((c) => (
                <button key={c} type="button" className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
              ))}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price">Price ↑</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="ds-grid">
              {items.map((p) => (
                <article key={p.id}>
                  <button type="button" className="ds-thumb" onClick={() => { setActive(p.id); setView('product'); }}>
                    <img src={p.img} alt={p.name} />
                  </button>
                  <div className="ds-meta">
                    <em>{p.cat}{p.tag ? ` · ${p.tag}` : ''}</em>
                    <h3>
                      <button type="button" onClick={() => { setActive(p.id); setView('product'); }}>{p.name}</button>
                    </h3>
                    <p>{p.short}</p>
                    <div className="ds-row">
                      <strong>€{p.price}</strong>
                      <button type="button" onClick={() => add(p.id)}>Add to cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {view === 'product' && product && (
          <section className="ds-product">
            <button type="button" className="ds-back" onClick={() => setView('home')}>← Back to catalog</button>
            <div className="ds-product-grid">
              <img src={product.img} alt={product.name} />
              <div>
                <em>{product.cat}</em>
                <h2>{product.name}</h2>
                <strong className="ds-price">€{product.price}</strong>
                <p>{product.desc}</p>
                <ul>{product.specs.map((s) => <li key={s}>{s}</li>)}</ul>
                <div className="ds-row">
                  <button type="button" className="primary" onClick={() => add(product.id)}>Add to cart</button>
                  <button type="button" onClick={() => setView('cart')}>View cart</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'cart' && (
          <section className="ds-cart-page">
            <h2>Your cart</h2>
            {!lines.length && <p>Cart is empty. <button type="button" onClick={() => setView('home')}>Continue shopping</button></p>}
            {lines.map((l) => {
              const p = PC_PRODUCTS.find((x) => x.id === l.id);
              return (
                <div key={l.id} className="ds-cart-line">
                  <img src={p.img} alt="" />
                  <div>
                    <b>{p.name}</b>
                    <span>€{p.price}</span>
                  </div>
                  <div className="ds-qty">
                    <button type="button" onClick={() => sub(l.id)}>−</button>
                    <em>{l.qty}</em>
                    <button type="button" onClick={() => add(l.id)}>+</button>
                  </div>
                  <strong>€{p.price * l.qty}</strong>
                </div>
              );
            })}
            {!!lines.length && (
              <div className="ds-cart-foot">
                <strong>Total €{total}</strong>
                <button type="button" className="primary" onClick={clear}>Demo checkout</button>
              </div>
            )}
          </section>
        )}
      </div>
    </StoreShell>
  );
}

function PremiumStoreDemo({ onClose }) {
  const [device, setDevice] = useState('desktop');
  const [view, setView] = useState('home');
  const [active, setActive] = useState(null);
  const [cat, setCat] = useState('All');
  const [wish, setWish] = useState({});
  const { lines, add, sub, clear, count } = useCart();
  const cats = ['All', 'Audio', 'Wearables', 'Accessories'];
  const items = PREMIUM_PRODUCTS.filter((p) => cat === 'All' || p.cat === cat);
  const total = lines.reduce((s, l) => s + (PREMIUM_PRODUCTS.find((p) => p.id === l.id)?.price || 0) * l.qty, 0);
  const product = PREMIUM_PRODUCTS.find((p) => p.id === active);

  return (
    <StoreShell title="02 · PREMIUM STORE" theme="light" device={device} setDevice={setDevice} onClose={onClose}>
      <div className="ds ds-premium">
        <header className="ds-nav light">
          <button type="button" className="ds-brand" onClick={() => setView('home')}>AURA</button>
          <nav>
            {cats.map((c) => (
              <button key={c} type="button" className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setView('home'); }}>{c}</button>
            ))}
          </nav>
          <button type="button" onClick={() => setView('cart')}>Bag · {count}</button>
        </header>

        {view === 'home' && (
          <>
            <section className="ds-hero premium">
              <div>
                <small>New season</small>
                <h2>Premium gadgets, soft luxury feel</h2>
                <p>Light minimal shop with product pages, wishlist and demo cart.</p>
              </div>
              <img src="/Public/Image/ShopPC.png" alt="" />
            </section>
            <div className="ds-grid premium">
              {items.map((p) => (
                <article key={p.id}>
                  <button type="button" className="ds-thumb" onClick={() => { setActive(p.id); setView('product'); }}>
                    <img src={p.img} alt={p.name} />
                  </button>
                  <div className="ds-meta">
                    <em>{p.cat}</em>
                    <h3><button type="button" onClick={() => { setActive(p.id); setView('product'); }}>{p.name}</button></h3>
                    <p>{p.short}</p>
                    <div className="ds-row">
                      <strong>€{p.price}</strong>
                      <button type="button" onClick={() => add(p.id)}>Add</button>
                      <button type="button" className="ghost" onClick={() => setWish((w) => ({ ...w, [p.id]: !w[p.id] }))}>
                        {wish[p.id] ? '♥' : '♡'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {view === 'product' && product && (
          <section className="ds-product light">
            <button type="button" className="ds-back" onClick={() => setView('home')}>← Back</button>
            <div className="ds-product-grid">
              <img src={product.img} alt={product.name} />
              <div>
                <em>{product.cat}</em>
                <h2>{product.name}</h2>
                <strong className="ds-price">€{product.price}</strong>
                <p>{product.desc}</p>
                <ul>{product.specs.map((s) => <li key={s}>{s}</li>)}</ul>
                <div className="ds-row">
                  <button type="button" className="primary" onClick={() => add(product.id)}>Add to bag</button>
                  <button type="button" onClick={() => setView('cart')}>Open bag</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'cart' && (
          <section className="ds-cart-page light">
            <h2>Bag</h2>
            {!lines.length && <p>Empty bag.</p>}
            {lines.map((l) => {
              const p = PREMIUM_PRODUCTS.find((x) => x.id === l.id);
              return (
                <div key={l.id} className="ds-cart-line">
                  <img src={p.img} alt="" />
                  <div><b>{p.name}</b><span>€{p.price}</span></div>
                  <div className="ds-qty">
                    <button type="button" onClick={() => sub(l.id)}>−</button>
                    <em>{l.qty}</em>
                    <button type="button" onClick={() => add(l.id)}>+</button>
                  </div>
                  <strong>€{p.price * l.qty}</strong>
                </div>
              );
            })}
            {!!lines.length && (
              <div className="ds-cart-foot">
                <strong>Total €{total}</strong>
                <button type="button" className="primary" onClick={clear}>Demo pay</button>
              </div>
            )}
          </section>
        )}
      </div>
    </StoreShell>
  );
}

function PizzaDemo({ onClose }) {
  const [device, setDevice] = useState('desktop');
  const [view, setView] = useState('home');
  const [active, setActive] = useState(null);
  const [cat, setCat] = useState('All');
  const [size, setSize] = useState({});
  const { lines, add, sub, clear, count } = useCart();
  const cats = ['All', 'Classic', 'Premium', 'Veggie'];
  const items = PIZZA_PRODUCTS.filter((p) => cat === 'All' || p.cat === cat);
  const product = PIZZA_PRODUCTS.find((p) => p.id === active);
  const mult = (id) => (size[id] === 'L' ? 1.25 : size[id] === 'S' ? 0.85 : 1);
  const total = lines.reduce((s, l) => s + (PIZZA_PRODUCTS.find((p) => p.id === l.id)?.price || 0) * mult(l.id) * l.qty, 0);

  return (
    <StoreShell title="03 · PIZZA" theme="food" device={device} setDevice={setDevice} onClose={onClose}>
      <div className="ds ds-pizza">
        <header className="ds-nav food">
          <button type="button" className="ds-brand" onClick={() => setView('home')}>FORNO</button>
          <nav>
            <button type="button" className={view === 'home' ? 'on' : ''} onClick={() => setView('home')}>Menu</button>
            <button type="button" className={view === 'cart' ? 'on' : ''} onClick={() => setView('cart')}>Order ({count})</button>
          </nav>
          <span>Open · 11:00–23:00</span>
        </header>

        {view === 'home' && (
          <>
            <section className="ds-hero food">
              <div>
                <small>Wood-fired · Demo menu</small>
                <h2>Modern pizza, real appetite</h2>
                <p>Pick size, open dish details, build an order — no real payment.</p>
              </div>
              <img src="/Public/Image/showcase-restaurant.jpg" alt="" />
            </section>
            <div className="ds-toolbar food">
              {cats.map((c) => (
                <button key={c} type="button" className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            <div className="ds-grid food">
              {items.map((p) => (
                <article key={p.id}>
                  <button type="button" className="ds-thumb" onClick={() => { setActive(p.id); setView('product'); }}>
                    <img src={p.img} alt={p.name} />
                  </button>
                  <div className="ds-meta">
                    <h3><button type="button" onClick={() => { setActive(p.id); setView('product'); }}>{p.name}</button></h3>
                    <p>{p.short}</p>
                    <div className="ds-sizes">
                      {['S', 'M', 'L'].map((s) => (
                        <button key={s} type="button" className={(size[p.id] || 'M') === s ? 'on' : ''} onClick={() => setSize((x) => ({ ...x, [p.id]: s }))}>{s}</button>
                      ))}
                    </div>
                    <div className="ds-row">
                      <strong>€{p.price}</strong>
                      <button type="button" onClick={() => add(p.id)}>Add</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {view === 'product' && product && (
          <section className="ds-product food">
            <button type="button" className="ds-back" onClick={() => setView('home')}>← Menu</button>
            <div className="ds-product-grid">
              <img src={product.img} alt={product.name} />
              <div>
                <em>{product.cat}</em>
                <h2>{product.name}</h2>
                <strong className="ds-price">€{product.price}</strong>
                <p>{product.desc}</p>
                <ul>{product.ingredients.map((s) => <li key={s}>{s}</li>)}</ul>
                <div className="ds-sizes">
                  {['S', 'M', 'L'].map((s) => (
                    <button key={s} type="button" className={(size[product.id] || 'M') === s ? 'on' : ''} onClick={() => setSize((x) => ({ ...x, [product.id]: s }))}>{s}</button>
                  ))}
                </div>
                <div className="ds-row">
                  <button type="button" className="primary" onClick={() => add(product.id)}>Add to order</button>
                  <button type="button" onClick={() => setView('cart')}>View order</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'cart' && (
          <section className="ds-cart-page food">
            <h2>Your order</h2>
            {!lines.length && <p>No pizzas yet.</p>}
            {lines.map((l) => {
              const p = PIZZA_PRODUCTS.find((x) => x.id === l.id);
              const line = p.price * mult(l.id) * l.qty;
              return (
                <div key={l.id} className="ds-cart-line">
                  <img src={p.img} alt="" />
                  <div><b>{p.name}</b><span>{size[l.id] || 'M'} · €{p.price}</span></div>
                  <div className="ds-qty">
                    <button type="button" onClick={() => sub(l.id)}>−</button>
                    <em>{l.qty}</em>
                    <button type="button" onClick={() => add(l.id)}>+</button>
                  </div>
                  <strong>€{line.toFixed(2)}</strong>
                </div>
              );
            })}
            {!!lines.length && (
              <div className="ds-cart-foot">
                <strong>Total €{total.toFixed(2)}</strong>
                <button type="button" className="primary" onClick={clear}>Demo place order</button>
              </div>
            )}
          </section>
        )}
      </div>
    </StoreShell>
  );
}

export default function DemoApps({ demoId, onClose }) {
  if (demoId === 'pcstore') return <PcStoreDemo onClose={onClose} />;
  if (demoId === 'ecommerce') return <PremiumStoreDemo onClose={onClose} />;
  if (demoId === 'pizza') return <PizzaDemo onClose={onClose} />;
  return null;
}
