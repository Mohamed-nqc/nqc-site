'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PublicNav, SiteFooter, LIGHT } from './components';
import { PRICING, fmt } from '../lib/supabase';

export default function HomePage() {
  const [activeCat, setActiveCat] = useState('vetements');
  const theme = LIGHT;

  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream }}>
      <PublicNav />

      <header style={{ padding: '64px 24px 48px', borderBottom: `1px solid ${theme.line}`, maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ color: theme.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
          L'atelier de pressing de référence · Molenbeek-Saint-Jean
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 500, lineHeight: 1.1, marginBottom: 18 }}>
          Votre pressing, <em style={{ fontStyle: 'italic', color: theme.gold }}>sans bouger</em><br />de chez vous.
        </h1>
        <p style={{ fontSize: 16, color: theme.creamDim, maxWidth: 520, lineHeight: 1.6, marginBottom: 28 }}>
          Un savoir-faire de pressing exigeant, pour tous vos vêtements — du quotidien aux tenues de cérémonie et traditionnelles.{' '}
          <span style={{ color: theme.creamDim }}>Et en plus, on vient récupérer et on vous ramène votre linge.</span>
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/pressing-domicile" style={{ background: theme.gold, color: '#faf8f4', padding: '14px 26px', fontSize: 14, fontWeight: 500, borderRadius: 4, textDecoration: 'none' }}>
            Pressing à domicile
          </Link>
          <a href="#tarifs" style={{ background: 'transparent', color: theme.cream, border: `1px solid ${theme.line}`, padding: '14px 24px', fontSize: 14, borderRadius: 4, textDecoration: 'none' }}>
            Voir les tarifs
          </a>
        </div>
      </header>

      <section id="tarifs" style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ color: theme.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Nos tarifs</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 16 }}>Toute notre vitrine, prix fixes</h2>
        <p style={{ color: theme.creamDim, fontSize: 15, maxWidth: 560, marginBottom: 28, lineHeight: 1.6 }}>
          Chaque article a un tarif fixe pour un lavage complet, ou un tarif réduit pour un repassage seul.
        </p>

        <PromoBanner theme={theme} />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {PRICING.map((c) => (
            <button key={c.cat} onClick={() => setActiveCat(c.cat)}
              style={{ border: `1px solid ${theme.line}`, background: activeCat === c.cat ? theme.gold : 'transparent', color: activeCat === c.cat ? '#faf8f4' : theme.creamDim, fontSize: 13, padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: activeCat === c.cat ? 500 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>

        <ConsultGrid theme={theme} items={PRICING.find((c) => c.cat === activeCat).items} />

        <div style={{ marginTop: 32, padding: '16px 18px', background: theme.inkSoft, borderLeft: `2px solid ${theme.gold}`, fontSize: 13, color: theme.creamDim, lineHeight: 1.6 }}>
          <strong style={{ color: theme.cream }}>Bon à savoir —</strong> le repassage seul s'applique aux vêtements déjà propres. Pour les pièces tachées ou abîmées, un lavage complet peut être recommandé par notre équipe.
        </div>
      </section>

      <section id="localisation" style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px', borderTop: `1px solid ${theme.line}` }}>
        <div style={{ color: theme.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Où nous retrouver</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 24 }}>Notre atelier à Molenbeek-Saint-Jean</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <InfoRow theme={theme} label="Adresse" value="Bd Léopold II 78, 1080 Molenbeek-Saint-Jean, Belgique" />
            <InfoRow theme={theme} label="Horaires" value="Lundi – Vendredi, 9h00 – 18h00" />
            <InfoRow theme={theme} label="Zone de collecte" value="Molenbeek-Saint-Jean et communes limitrophes de Bruxelles" />
          </div>
          <div style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 10, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', color: theme.creamDim, fontSize: 13 }}>
            Carte — Bd Léopold II 78, 1080 Molenbeek-Saint-Jean
          </div>
        </div>
      </section>

      <section id="contact" style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px', borderTop: `1px solid ${theme.line}` }}>
        <div style={{ color: theme.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Nous contacter</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 24 }}>Une question ? Parlons-en.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <ContactCard theme={theme} label="Téléphone" value="+32 486 06 69 43" href="tel:+32486066943" />
          <ContactCard theme={theme} label="Email" value="contact@newqualitycleaning.be" href="mailto:contact@newqualitycleaning.be" />
          <ContactCard theme={theme} label="Instagram" value="@newqualitycleaning" href="https://instagram.com" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PromoBanner({ theme }) {
  const promoItems = PRICING.flatMap((c) => c.items).filter((it) => it.promo !== undefined);
  return (
    <div style={{ border: `1px solid ${theme.gold}`, borderRadius: 10, padding: 20, marginBottom: 28, background: theme.inkCard }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ background: theme.gold, color: '#faf8f4', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20 }}>Promo du mois</span>
        <span style={{ fontSize: 13, color: theme.creamDim }}>Tarifs réduits sur une sélection ce mois-ci</span>
      </div>
      <ConsultGrid theme={theme} items={promoItems} />
    </div>
  );
}

function ConsultGrid({ theme, items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {items.map((it) => (
        <div key={it.name} style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>{it.name}</div>
          <div style={{ fontSize: 12, color: theme.creamDim, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {it.promo !== undefined ? (
              <span><span style={{ textDecoration: 'line-through', marginRight: 6 }}>{fmt(it.lavage)}</span><span style={{ color: theme.ok, fontWeight: 600 }}>{fmt(it.promo)}</span></span>
            ) : (
              <span>Lavage : <b style={{ color: theme.cream }}>{fmt(it.lavage)}</b></span>
            )}
            <span>{it.repassage === null ? 'Repassage non disponible' : <>Repassage seul : <b style={{ color: theme.cream }}>{fmt(it.repassage)}</b></>}</span>
          </div>
          <Link href="/pressing-domicile" style={{ marginTop: 'auto', textAlign: 'center', background: 'transparent', color: theme.cream, border: `1px solid ${theme.line}`, padding: 9, borderRadius: 4, fontSize: 13, textDecoration: 'none' }}>
            Commander à domicile
          </Link>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ theme, label, value }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.4, color: theme.creamDim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15 }}>{value}</div>
    </div>
  );
}

function ContactCard({ theme, label, value, href }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ border: `1px solid ${theme.line}`, borderRadius: 10, padding: 22, textDecoration: 'none', color: theme.cream, display: 'block' }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4, color: theme.creamDim, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>{value}</div>
    </a>
  );
}
