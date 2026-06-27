'use client';
import { useState } from 'react';
import { PublicNav, SiteFooter, DARK } from '../components';
import { PRICING, fmt, slugify, orderLabel, getNextSeq, supabase } from '../../lib/supabase';

export default function PressingDomicilePage() {
  const theme = DARK;
  const [cart, setCart] = useState({});
  const [activeCat, setActiveCat] = useState('vetements');
  const [stage, setStage] = useState('browse');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', address: '', addressNotes: '', returnMode: 'meme', otherAddress: '', payMode: 'recuperation', split: '1' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cartCount = Object.values(cart).reduce((s, it) => s + it.qty, 0);
  const cartTotal = Object.values(cart).reduce((s, it) => s + it.qty * it.price, 0);

  const addToCart = (itemId, name, price) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId]) delete next[itemId];
      else next[itemId] = { qty: 1, name, price };
      return next;
    });
  };

  const BOOKED_SLOTS = {};
  const ALL_SLOTS = ['9h30 – 11h30', '11h30 – 13h30', '14h00 – 16h00', '16h00 – 18h00'];

  const startTunnel = () => { setStage('tunnel'); setStep(1); };
  const goNext = () => {
    if (step === 2 && !selectedSlot) { alert('Choisissez un créneau de collecte.'); return; }
    if (step === 3) { submitOrder(); return; }
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    if (step === 1) { setStage('browse'); return; }
    setStep((s) => s - 1);
  };

  const submitOrder = async () => {
    if (Object.keys(cart).length === 0) { alert('Votre sélection est vide.'); return; }
    if (!form.name || !form.phone || !form.address) { alert('Merci de renseigner votre nom, téléphone et adresse.'); return; }
    setSubmitting(true);
    try {
      const seq = await getNextSeq();
      const ref = orderLabel(seq);
      const { error } = await supabase.from('orders').insert({
        seq, ref,
        client: form.name, phone: form.phone, address: form.address, address_notes: form.addressNotes,
        return_mode: form.returnMode, other_address: form.otherAddress,
        items: Object.values(cart).map((it) => ({ name: it.name, qty: it.qty, price: it.price })),
        total: cartTotal, pay_mode: form.payMode, pay_split: form.split,
        collecte_date: selectedDate, collecte_slot: selectedSlot, status: 'recu',
      });
      if (error) throw error;
      setConfirmedOrder({ ref });
      setStage('confirmed');
      setCart({});
    } catch (e) {
      alert('Une erreur est survenue. Réessayez dans un instant.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (stage === 'confirmed' && confirmedOrder) {
    return (
      <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream }}>
        <PublicNav />
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, color: theme.gold, marginBottom: 20 }}>✓</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 12 }}>Votre collecte est confirmée</h2>
          <p style={{ color: theme.creamDim, marginBottom: 24, lineHeight: 1.6 }}>Notre équipe viendra récupérer votre linge au créneau choisi. Vous serez prévenu dès qu'il sera prêt.</p>
          <div style={{ display: 'inline-block', border: `1px solid ${theme.line}`, padding: '10px 22px', borderRadius: 4, fontSize: 13, letterSpacing: 1, color: theme.gold, marginBottom: 32 }}>Commande {confirmedOrder.ref}</div>
          <div><button onClick={() => setStage('browse')} style={primaryBtn(theme)}>Retour à la boutique</button></div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (stage === 'tunnel') {
    return (
      <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream }}>
        <PublicNav />
        <OrderTunnel theme={theme} step={step} form={form} setForm={setForm} cart={cart} cartTotal={cartTotal}
          selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot}
          BOOKED_SLOTS={BOOKED_SLOTS} ALL_SLOTS={ALL_SLOTS} goNext={goNext} goPrev={goPrev} submitting={submitting} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, paddingBottom: cartCount > 0 ? 96 : 0 }}>
      <PublicNav />
      <header style={{ padding: '48px 24px 32px', borderBottom: `1px solid ${theme.line}`, maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ color: theme.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Pressing à domicile</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 500, marginBottom: 12 }}>Composez votre commande</h1>
        <p style={{ fontSize: 15, color: theme.creamDim, maxWidth: 520 }}>Choisissez vos articles, indiquez où venir les récupérer, et nous nous occupons du reste.</p>
      </header>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px' }}>
        <PromoBanner theme={theme} cart={cart} addToCart={addToCart} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {PRICING.map((c) => (
            <button key={c.cat} onClick={() => setActiveCat(c.cat)}
              style={{ border: `1px solid ${theme.line}`, background: activeCat === c.cat ? theme.gold : 'transparent', color: activeCat === c.cat ? '#faf8f4' : theme.creamDim, fontSize: 13, padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: activeCat === c.cat ? 500 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
        <ProductGrid theme={theme} items={PRICING.find((c) => c.cat === activeCat).items} cart={cart} addToCart={addToCart} />
      </section>

      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.inkCard, borderTop: `1px solid ${theme.line}`, padding: '16px 24px', zIndex: 80 }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, color: theme.creamDim }}><strong style={{ color: theme.cream }}>{cartCount} article{cartCount > 1 ? 's' : ''}</strong> sélectionné{cartCount > 1 ? 's' : ''}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22 }}>{fmt(cartTotal)}</div>
              <button onClick={startTunnel} style={primaryBtn(theme)}>Finaliser ma commande</button>
            </div>
          </div>
        </div>
      )}
      {cartCount === 0 && <SiteFooter />}
    </div>
  );
}

function PromoBanner({ theme, cart, addToCart }) {
  const promoItems = PRICING.flatMap((c) => c.items).filter((it) => it.promo !== undefined);
  return (
    <div style={{ border: `1px solid ${theme.gold}`, borderRadius: 10, padding: 20, marginBottom: 28, background: theme.inkCard }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ background: theme.gold, color: '#faf8f4', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20 }}>Promo du mois</span>
        <span style={{ fontSize: 13, color: theme.creamDim }}>Tarifs réduits sur une sélection ce mois-ci</span>
      </div>
      <ProductGrid theme={theme} items={promoItems} cart={cart} addToCart={addToCart} />
    </div>
  );
}

function ProductGrid({ theme, items, cart, addToCart }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {items.map((it) => {
        const itemId = slugify(it.name);
        const inCart = !!cart[itemId];
        const effectivePrice = it.promo !== undefined ? it.promo : it.lavage;
        return (
          <div key={itemId} style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>{it.name}</div>
            <div style={{ fontSize: 12, color: theme.creamDim, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {it.promo !== undefined ? (
                <span><span style={{ textDecoration: 'line-through', marginRight: 6 }}>{fmt(it.lavage)}</span><span style={{ color: theme.ok, fontWeight: 600 }}>{fmt(it.promo)}</span></span>
              ) : (
                <span>Lavage : <b style={{ color: theme.cream }}>{fmt(it.lavage)}</b></span>
              )}
              <span>{it.repassage === null ? 'Repassage non disponible' : <>Repassage seul : <b style={{ color: theme.cream }}>{fmt(it.repassage)}</b></>}</span>
            </div>
            <button onClick={() => addToCart(itemId, it.name, effectivePrice)}
              style={{ marginTop: 'auto', background: inCart ? theme.gold : 'transparent', color: inCart ? '#faf8f4' : theme.cream, border: `1px solid ${inCart ? theme.gold : theme.line}`, padding: 9, borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
              {inCart ? '✓ Dans le panier' : 'Ajouter au panier'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function primaryBtn(theme) { return { background: theme.gold, color: '#faf8f4', border: 'none', padding: '14px 26px', fontSize: 14, fontWeight: 500, borderRadius: 4, cursor: 'pointer' }; }
function ghostBtn(theme) { return { background: 'transparent', color: theme.cream, border: `1px solid ${theme.line}`, padding: '14px 24px', fontSize: 14, borderRadius: 4, cursor: 'pointer' }; }

function OrderTunnel({ theme, step, form, setForm, cart, cartTotal, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot, BOOKED_SLOTS, ALL_SLOTS, goNext, goPrev, submitting }) {
  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstWeekday = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7;
  const monthLabel = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 140px' }}>
      <div style={{ color: theme.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Étape {step} / 3</div>

      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, marginBottom: 24 }}>Où venons-nous récupérer votre linge ?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {Object.values(cart).map((it, i) => <span key={i} style={{ border: `1px solid ${theme.line}`, borderRadius: 20, padding: '6px 14px', fontSize: 13, background: theme.inkSoft }}>{it.qty} × {it.name}</span>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Nom" value={form.name} onChange={(v) => updateForm('name', v)} placeholder="Votre nom" theme={theme} />
            <Field label="Téléphone" value={form.phone} onChange={(v) => updateForm('phone', v)} placeholder="06 00 00 00 00" theme={theme} />
          </div>
          <Field label="Adresse de collecte" value={form.address} onChange={(v) => updateForm('address', v)} placeholder="Numéro et nom de rue, ville" theme={theme} full />
          <Field label="Précisions d'accès (optionnel)" value={form.addressNotes} onChange={(v) => updateForm('addressNotes', v)} placeholder="Étage, code, interphone..." theme={theme} full />
          <h3 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 16 }}>Comment récupérer votre linge propre ?</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <OptionCard theme={theme} active={form.returnMode === 'meme'} onClick={() => updateForm('returnMode', 'meme')} title="Même adresse" desc="Livraison à l'adresse de collecte" />
            <OptionCard theme={theme} active={form.returnMode === 'autre'} onClick={() => updateForm('returnMode', 'autre')} title="Autre adresse" desc="Préciser une adresse différente" />
            <OptionCard theme={theme} active={form.returnMode === 'magasin'} onClick={() => updateForm('returnMode', 'magasin')} title="Retrait au magasin" desc="Vous venez chercher sur place" />
          </div>
          {form.returnMode === 'autre' && <Field label="Adresse de livraison" value={form.otherAddress} onChange={(v) => updateForm('otherAddress', v)} placeholder="Adresse complète" theme={theme} full />}
          <h3 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 16 }}>Quand souhaitez-vous payer ?</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <OptionCard theme={theme} active={form.payMode === 'recuperation'} onClick={() => updateForm('payMode', 'recuperation')} title="Payer lors de la récupération" desc="Espèces ou carte sur place" />
            <OptionCard theme={theme} active={form.payMode === 'site'} onClick={() => { updateForm('payMode', 'site'); updateForm('split', '1'); }} title="Payer sur le site" desc="En ligne, immédiatement" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 500, marginTop: 24, marginBottom: 16 }}>En combien de fois ?</h3>
          <div style={{ display: 'flex', gap: 10, opacity: form.payMode === 'site' ? 0.4 : 1, pointerEvents: form.payMode === 'site' ? 'none' : 'auto' }}>
            <OptionCard theme={theme} active={form.split === '1'} onClick={() => updateForm('split', '1')} title="En une fois" desc="Montant total réglé en une fois" />
            <OptionCard theme={theme} active={form.split === '2'} onClick={() => updateForm('split', '2')} title="En deux fois" desc="Moitié collecte, moitié livraison" />
          </div>
          {form.payMode === 'site' && <div style={{ fontSize: 12, color: theme.creamDim, marginTop: 10 }}>Le paiement en deux fois n'est disponible que pour un paiement à la récupération.</div>}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, marginBottom: 24 }}>Choisissez votre créneau de collecte</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div style={{ fontSize: 13, color: theme.creamDim, marginBottom: 10, textTransform: 'capitalize' }}>{monthLabel}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} style={{ fontSize: 11, textAlign: 'center', color: theme.creamDim }}>{d}</div>)}
                {Array.from({ length: firstWeekday }).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(today.getFullYear(), today.getMonth(), day);
                  const disabled = date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || date.getDay() === 0;
                  const selected = selectedDate === day;
                  return (
                    <div key={day} onClick={() => !disabled && setSelectedDate(day)}
                      style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.line}`, borderRadius: 4, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.25 : 1, background: selected ? theme.gold : 'transparent', color: selected ? '#faf8f4' : theme.creamDim, fontWeight: selected ? 500 : 400 }}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: theme.creamDim, marginBottom: 10 }}>Créneaux disponibles</div>
              {!selectedDate && <div style={{ fontSize: 13, color: theme.creamDim }}>Sélectionnez une date.</div>}
              {selectedDate && ALL_SLOTS.map((s) => (
                <div key={s} onClick={() => setSelectedSlot(s)}
                  style={{ border: `1px solid ${selectedSlot === s ? theme.gold : theme.line}`, padding: '14px 16px', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginBottom: 10, color: selectedSlot === s ? theme.cream : theme.creamDim, background: selectedSlot === s ? 'rgba(31,30,28,0.05)' : 'transparent' }}>
                  {s}
                </div>
              ))}
              <div style={{ marginTop: 24, padding: '16px 18px', background: theme.inkSoft, borderLeft: `2px solid ${theme.gold}`, fontSize: 13, color: theme.creamDim, lineHeight: 1.6 }}>
                <strong style={{ color: theme.cream }}>À propos du retour —</strong> comptez 1 à 3 jours après la collecte.
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, marginBottom: 24 }}>Récapitulatif de votre commande</h2>
          {Object.values(cart).map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 0', borderBottom: `1px solid ${theme.line}` }}>
              <span>{it.qty} × {it.name}</span><span>{fmt(it.qty * it.price)}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: 20, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 13, color: theme.creamDim, lineHeight: 1.7 }}>
              <div>Collecte le {selectedDate} {monthLabel} · {selectedSlot}</div>
              <div>{form.returnMode === 'meme' ? 'Retour même adresse' : form.returnMode === 'autre' ? 'Retour autre adresse' : 'Retrait au magasin'}</div>
              <div>{form.payMode === 'site' ? 'Paiement intégral sur le site' : form.split === '2' ? `Deux fois — ${fmt(cartTotal / 2)} chaque` : 'Une fois lors de la récupération'}</div>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, textAlign: 'right' }}>{fmt(cartTotal)}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
        <button onClick={goPrev} style={ghostBtn(theme)}>Retour</button>
        <button onClick={goNext} disabled={submitting} style={primaryBtn(theme)}>{submitting ? 'Envoi...' : step === 3 ? 'Confirmer la commande' : 'Continuer'}</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, theme, full }) {
  return (
    <div style={{ marginBottom: 16, gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: 0.5, color: theme.creamDim, marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: theme.inkSoft, border: `1px solid ${theme.line}`, color: theme.cream, padding: '12px 14px', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );
}

function OptionCard({ theme, active, onClick, title, desc }) {
  return (
    <div onClick={onClick} style={{ flex: 1, border: `1px solid ${active ? theme.gold : theme.line}`, padding: 16, borderRadius: 4, cursor: 'pointer', background: active ? 'rgba(31,30,28,0.05)' : 'transparent' }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: theme.creamDim }}>{desc}</div>
    </div>
  );
}
