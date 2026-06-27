'use client';
import Link from 'next/link';

export const LIGHT = {
  ink: '#faf8f4', inkSoft: '#f1ede4', inkCard: '#e8e2d3',
  cream: '#1f1e1c', creamDim: '#6b6658', gold: '#1f1e1c',
  line: 'rgba(31,30,28,0.14)', ok: '#4a7a58', warn: '#b97f2a', wait: '#8a8579', info: '#3a6f96',
};

export const DARK = {
  ink: '#1f1e1c', inkSoft: '#2a2826', inkCard: '#332f2b',
  cream: '#f5f1e8', creamDim: '#9b9588', gold: '#c9a876',
  line: 'rgba(245,241,232,0.10)', ok: '#7fae8a', warn: '#d8a657', wait: '#8a8579', info: '#7aa9c9',
};

export function PublicNav() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(31,30,28,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(245,241,232,0.10)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#faf8f4', letterSpacing: 1 }}>NQC</span>
          <span style={{ fontSize: 9, letterSpacing: 2, color: '#cfc9ba', textTransform: 'uppercase' }}>New Quality Cleaning</span>
        </Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/#tarifs" style={navLink}>Nos tarifs</Link>
          <Link href="/pressing-domicile" style={navLink}>Pressing à domicile</Link>
          <Link href="/#localisation" style={navLink}>Où nous retrouver</Link>
          <Link href="/#contact" style={navLink}>Nous contacter</Link>
        </div>
      </div>
    </nav>
  );
}

const navLink = { color: '#cfc9ba', textDecoration: 'none', fontSize: 13 };

export function SiteFooter() {
  return (
    <footer style={{ padding: '40px 24px', textAlign: 'center', color: '#6b6658', fontSize: 13, borderTop: '1px solid rgba(31,30,28,0.14)' }}>
      <div>New Quality Cleaning — Pressing à domicile, Molenbeek-Saint-Jean</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/mentions-legales" style={{ color: '#6b6658', fontSize: 12, textDecoration: 'none', borderBottom: '1px solid rgba(31,30,28,0.14)' }}>Mentions légales</Link>
        <Link href="/acces-equipe" style={{ color: '#6b6658', fontSize: 12, textDecoration: 'none', borderBottom: '1px solid rgba(31,30,28,0.14)' }}>Accès équipe</Link>
      </div>
    </footer>
  );
}

export function categoryIcon(name) {
  const n = name.toLowerCase();
  const ICONS = {
    haut: 'M22 10 L32 16 L42 10 L54 18 L48 30 L42 26 L42 54 L22 54 L22 26 L16 30 L10 18 Z',
    pantalon: 'M20 8 L44 8 L46 56 L36 56 L32 24 L28 56 L18 56 Z',
    robe: 'M24 8 L40 8 L42 20 L52 54 L12 54 L22 20 Z',
  };
  if (n.includes('chemise') || n.includes('blouse') || n.includes('t-shirt') || n.includes('sweat') || n.includes('pull') || n.includes('gilet')) return ICONS.haut;
  if (n.includes('pantalon') || n.includes('jean') || n.includes('short')) return ICONS.pantalon;
  return ICONS.robe;
}
