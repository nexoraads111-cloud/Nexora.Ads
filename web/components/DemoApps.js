'use client';

import { useMemo, useState } from 'react';

const PC_ITEMS = [
  { id: 'gpu1', cat: 'GPU', name: 'RTX 4070 Super', price: 649, tag: 'Popular', img: '/Public/Image/PcstoreScreen.png' },
  { id: 'gpu2', cat: 'GPU', name: 'RX 7800 XT', price: 519, tag: 'Value', img: '/Public/Image/PcstoreShowcase.png' },
  { id: 'cpu1', cat: 'CPU', name: 'Ryzen 7 7800X3D', price: 369, tag: 'Gaming', img: '/Public/Image/showcase-tech.jpg' },
  { id: 'cpu2', cat: 'CPU', name: 'Core i5-14600K', price: 299, tag: '', img: '/Public/Image/showcase-tech.jpg' },
  { id: 'ram1', cat: 'RAM', name: '32GB DDR5 6000', price: 119, tag: '', img: '/Public/Image/PcstoreScreen.png' },
  { id: 'ssd1', cat: 'SSD', name: '2TB NVMe Gen4', price: 149, tag: 'Fast', img: '/Public/Image/PcstoreShowcase.png' },
];

const GADGETS = [
  { id: 'g1', cat: 'Audio', name: 'Aura Buds Pro', price: 129, tone: '#1f2937' },
  { id: 'g2', cat: 'Wearables', name: 'Pulse Watch S', price: 189, tone: '#111827' },
  { id: 'g3', cat: 'Accessories', name: 'Carbon Case Mag', price: 39, tone: '#374151' },
  { id: 'g4', cat: 'Audio', name: 'Studio Mic Mini', price: 89, tone: '#4b5563' },
  { id: 'g5', cat: 'Accessories', name: 'Desk Mat XL', price: 49, tone: '#6b7280' },
  { id: 'g6', cat: 'Wearables', name: 'Link Band Steel', price: 59, tone: '#9ca3af' },
];

const PIZZAS = [
  { id: 'p1', cat: 'Classic', name: 'Margherita', price: 9.5, ingredients: 'Tomato, mozzarella, basil' },
  { id: 'p2', cat: 'Classic', name: 'Pepperoni', price: 11.5, ingredients: 'Pepperoni, mozzarella' },
  { id: 'p3', cat: 'Premium', name: 'Truffle Funghi', price: 14.5, ingredients: 'Mushrooms, truffle oil' },
  { id: 'p4', cat: 'Premium', name: 'Diavola Hot', price: 12.5, ingredients: 'Spicy salami, chili' },
  { id: 'p5', cat: 'Veggie', name: 'Garden Fresh', price: 10.5, ingredients: 'Peppers, olives, onion' },
  { id: 'p6', cat: 'Classic', name: 'Four Cheese', price: 12, ingredients: 'Mozzarella, gorgonzola, parmesan' },
];

function useCart() {
  const [cart, setCart] = useState({});
  const lines = useMemo(
    () => Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty })),
    [cart]
  );
  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) - 1) };
      if (!next[id]) delete next[id];
      return next;
    });
  const clear = () => setCart({});
  return { cart, lines, add, sub, clear };
}

function DemoShell({ title, children, onClose, device, setDevice, labels, theme = 'dark' }) {
  return (
    <div className={`demo-frame theme-${theme}`} data-device={device}>
      <div className="demo-chrome">
        <div className="demo-dots" aria-hidden><span /><span /><span /></div>
        <b>{title}</b>
        <div className="demo-devices">
          {['desktop', 'tablet', 'mobile'].map((d) => (
            <button key={d} type="button" className={device === d ? 'active' : ''} onClick={() => setDevice(d)}>
              {labels[d]}
            </button>
          ))}
        </div>
        <button type="button" className="demo-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="demo-viewport">{children}</div>
      <p className="demo-note">Demo only — example prices, no real checkout.</p>
    </div>
  );
}

function PcStoreDemo({ onClose, labels }) {
  const [device, setDevice] = useState('desktop');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('pop');
  const { add, sub, clear, lines } = useCart();
  const cats = ['All', 'GPU', 'CPU', 'RAM', 'SSD'];
  const items = useMemo(() => {
    let list = PC_ITEMS.filter((i) => (cat === 'All' || i.cat === cat) && i.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'price') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [q, cat, sort]);
  const total = lines.reduce((s, l) => s + (PC_ITEMS.find((i) => i.id === l.id)?.price || 0) * l.qty, 0);

  return (
    <DemoShell title="01 / PC STORE — DEMO" onClose={onClose} device={device} setDevice={setDevice} labels={labels} theme="dark">
      <div className="demo-app demo-pc">
        <header>
          <strong>NEON<span>PC</span></strong>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components…" />
          <em>Cart {lines.reduce((s, l) => s + l.qty, 0)}</em>
        </header>
        <div className="demo-banner pc-hero">
          <div>
            <small>Gaming season</small>
            <h3>Power for your victories</h3>
            <p>Demo catalog — example EUR prices</p>
          </div>
        </div>
        <div className="demo-toolbar">
          {cats.map((c) => (
            <button key={c} type="button" className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="pop">Popular</option>
            <option value="price">Price ↑</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="demo-grid">
          {items.map((i) => (
            <article key={i.id}>
              <div className="demo-thumb photo" style={{ backgroundImage: `url(${i.img})` }} />
              <h4>{i.name}</h4>
              <p>{i.tag && <span>{i.tag}</span>} €{i.price}</p>
              <button type="button" onClick={() => add(i.id)}>Add</button>
            </article>
          ))}
        </div>
        <aside className="demo-cart">
          <h4>Cart</h4>
          {!lines.length && <p>Empty</p>}
          {lines.map((l) => {
            const item = PC_ITEMS.find((i) => i.id === l.id);
            return (
              <div key={l.id} className="demo-cart-row">
                <span>{item.name}</span>
                <div>
                  <button type="button" onClick={() => sub(l.id)}>−</button>
                  <b>{l.qty}</b>
                  <button type="button" onClick={() => add(l.id)}>+</button>
                </div>
              </div>
            );
          })}
          <strong>Total €{total}</strong>
          <button type="button" className="demo-checkout" disabled={!lines.length} onClick={clear}>Demo checkout</button>
        </aside>
      </div>
    </DemoShell>
  );
}

function EcommerceDemo({ onClose, labels }) {
  const [device, setDevice] = useState('desktop');
  const [cat, setCat] = useState('All');
  const [wish, setWish] = useState({});
  const { add, sub, clear, lines } = useCart();
  const cats = ['All', 'Audio', 'Wearables', 'Accessories'];
  const items = GADGETS.filter((i) => cat === 'All' || i.cat === cat);
  const total = lines.reduce((s, l) => s + (GADGETS.find((i) => i.id === l.id)?.price || 0) * l.qty, 0);

  return (
    <DemoShell title="02 / PREMIUM STORE — DEMO" onClose={onClose} device={device} setDevice={setDevice} labels={labels} theme="light">
      <div className="demo-app demo-shop light">
        <div className="demo-banner shop-hero">
          <div>
            <small>New season</small>
            <h3>Premium gadgets, soft luxury feel</h3>
          </div>
          <img src="/Public/Image/ShopPC.png" alt="" />
        </div>
        <div className="demo-toolbar">
          {cats.map((c) => (
            <button key={c} type="button" className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
          <em>♥ {Object.values(wish).filter(Boolean).length}</em>
        </div>
        <div className="demo-grid shop">
          {items.map((i) => (
            <article key={i.id}>
              <div className="demo-thumb shop" style={{ background: `linear-gradient(145deg, ${i.tone}, #f5f0e8)` }} />
              <h4>{i.name}</h4>
              <p>{i.cat} · €{i.price}</p>
              <div className="demo-row">
                <button type="button" onClick={() => add(i.id)}>Add</button>
                <button type="button" className="ghost" onClick={() => setWish((w) => ({ ...w, [i.id]: !w[i.id] }))}>
                  {wish[i.id] ? '♥' : '♡'}
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="demo-cart light">
          <h4>Bag</h4>
          {lines.map((l) => {
            const item = GADGETS.find((i) => i.id === l.id);
            return (
              <div key={l.id} className="demo-cart-row">
                <span>{item.name}</span>
                <div>
                  <button type="button" onClick={() => sub(l.id)}>−</button>
                  <b>{l.qty}</b>
                  <button type="button" onClick={() => add(l.id)}>+</button>
                </div>
              </div>
            );
          })}
          <strong>Total €{total}</strong>
          <button type="button" className="demo-checkout" disabled={!lines.length} onClick={clear}>Demo pay</button>
        </aside>
      </div>
    </DemoShell>
  );
}

function PizzaDemo({ onClose, labels }) {
  const [device, setDevice] = useState('desktop');
  const [cat, setCat] = useState('All');
  const [size, setSize] = useState({});
  const { add, sub, clear, lines } = useCart();
  const cats = ['All', 'Classic', 'Premium', 'Veggie'];
  const items = PIZZAS.filter((i) => cat === 'All' || i.cat === cat);
  const total = lines.reduce((s, l) => {
    const base = PIZZAS.find((i) => i.id === l.id)?.price || 0;
    const mult = size[l.id] === 'L' ? 1.25 : size[l.id] === 'S' ? 0.85 : 1;
    return s + base * mult * l.qty;
  }, 0);

  return (
    <DemoShell title="03 / PIZZA — DEMO" onClose={onClose} device={device} setDevice={setDevice} labels={labels} theme="food">
      <div className="demo-app demo-pizza food">
        <div className="demo-banner pizza">
          <div>
            <small>Open · 11:00–23:00</small>
            <h3>Wood-fired pizza, modern vibe</h3>
            <p>Demo menu</p>
          </div>
          <img src="/Public/Image/showcase-restaurant.jpg" alt="" />
        </div>
        <div className="demo-toolbar">
          {cats.map((c) => (
            <button key={c} type="button" className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="demo-grid pizza">
          {items.map((i) => (
            <article key={i.id}>
              <div className="demo-thumb pizza">{i.name[0]}</div>
              <h4>{i.name}</h4>
              <p>{i.ingredients}</p>
              <div className="demo-sizes">
                {['S', 'M', 'L'].map((s) => (
                  <button key={s} type="button" className={(size[i.id] || 'M') === s ? 'active' : ''} onClick={() => setSize((x) => ({ ...x, [i.id]: s }))}>{s}</button>
                ))}
              </div>
              <div className="demo-row">
                <b>€{i.price}</b>
                <button type="button" onClick={() => add(i.id)}>Add</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="demo-cart pizza">
          <h4>Order</h4>
          {lines.map((l) => {
            const item = PIZZAS.find((i) => i.id === l.id);
            return (
              <div key={l.id} className="demo-cart-row">
                <span>{item.name} ({size[l.id] || 'M'})</span>
                <div>
                  <button type="button" onClick={() => sub(l.id)}>−</button>
                  <b>{l.qty}</b>
                  <button type="button" onClick={() => add(l.id)}>+</button>
                </div>
              </div>
            );
          })}
          <strong>Total €{total.toFixed(2)}</strong>
          <button type="button" className="demo-checkout" disabled={!lines.length} onClick={clear}>Demo place order</button>
        </aside>
      </div>
    </DemoShell>
  );
}

export default function DemoApps({ demoId, onClose, labels }) {
  if (demoId === 'pcstore') return <PcStoreDemo onClose={onClose} labels={labels} />;
  if (demoId === 'ecommerce') return <EcommerceDemo onClose={onClose} labels={labels} />;
  if (demoId === 'pizza') return <PizzaDemo onClose={onClose} labels={labels} />;
  return null;
}
