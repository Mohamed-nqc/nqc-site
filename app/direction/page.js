'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, STATUS_META, fmt } from '../../lib/supabase';

const DARK = {
  ink: '#1f1e1c', inkSoft: '#2a2826', inkCard: '#332f2b',
  cream: '#f5f1e8', creamDim: '#9b9588', gold: '#c9a876', line: 'rgba(245,241,232,0.10)',
  ok: '#7fae8a', warn: '#d8a657', wait: '#8a8579', info: '#7aa9c9',
};

export default function DirectionPage() {
  const router = useRouter();
  const theme = DARK;
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('nqc-role') !== 'direction') {
      router.push('/acces-equipe');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').order('seq', { ascending: false });
    setOrders(data || []);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchOrders();
    const channel = supabase.channel('orders-direction').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authorized, fetchOrders]);

  if (!authorized || orders === null) {
    return <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  }

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total), 0);
  const counts = { recu: 0, lavage: 0, pret: 0, livre: 0 };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  const itemCounts = {};
  orders.forEach((o) => o.items.forEach((it) => { itemCounts[it.name] = (itemCounts[it.name] || 0) + it.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const filtered = filter === 'tous' ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (seq, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('seq', seq);
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, display: 'grid', gridTemplateColumns: '220px 1fr' }}>
      <TeamSidebar theme={theme} active="direction" router={router} />
      <main style={{ padding: '32px 40px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 8 }}>Vue d'ensemble</h1>
        <p style={{ color: theme.creamDim, fontSize: 14, marginBottom: 32 }}>L'activité de New Quality Cleaning en temps réel</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          <StatCard theme={theme} label="Chiffre d'affaires" value={fmt(totalRevenue)} />
          <StatCard theme={theme} label="Commandes totales" value={orders.length} />
          <StatCard theme={theme} label="Article le plus commandé" value={topItems[0] ? topItems[0][0] : '—'} />
          <StatCard theme={theme} label="Prêtes à livrer" value={counts.pret || 0} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <Panel theme={theme} title="Statut des commandes">
            <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              {Object.keys(STATUS_META).map((key) => { const pct = orders.length ? (counts[key] / orders.length) * 100 : 0; return <div key={key} style={{ width: `${pct}%`, background: STATUS_META[key].color }} />; })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {Object.keys(STATUS_META).map((key) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: theme.creamDim }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_META[key].color }} />{STATUS_META[key].label} — {counts[key] || 0}
                </div>
              ))}
            </div>
          </Panel>
          <Panel theme={theme} title="Articles les plus commandés">
            {topItems.length === 0 && <div style={{ fontSize: 13, color: theme.creamDim }}>Pas encore de commande.</div>}
            {topItems.map(([name, qty], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: theme.creamDim, width: 18 }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: 13 }}>{name}</div>
                <div style={{ fontSize: 13, color: theme.creamDim }}>{qty}</div>
              </div>
            ))}
          </Panel>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Toutes les commandes</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {[{ key: 'tous', label: 'Toutes' }, ...Object.keys(STATUS_META).map((k) => ({ key: k, label: STATUS_META[k].label }))].map((o) => (
            <button key={o.key} onClick={() => setFilter(o.key)} style={{ border: `1px solid ${theme.line}`, background: filter === o.key ? theme.gold : 'transparent', color: filter === o.key ? '#faf8f4' : theme.creamDim, fontSize: 13, padding: '7px 15px', borderRadius: 20, cursor: 'pointer' }}>{o.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ fontSize: 13, color: theme.creamDim, padding: '20px 0' }}>Aucune commande pour le moment.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Référence', 'Client', 'Articles', 'Collecte', 'Statut', 'Mettre à jour'].map((h) => <th key={h} style={{ textAlign: 'left', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: theme.creamDim, padding: '10px 12px', borderBottom: `1px solid ${theme.line}` }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.seq} style={{ borderBottom: `1px solid ${theme.line}` }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600 }}>{o.ref}</div>
                    <div style={{ fontSize: 11, color: theme.creamDim }}>{o.collecte_slot}</div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13 }}>{o.client}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: theme.creamDim }}>{o.items.map((it) => `${it.qty} × ${it.name}`).join(', ')}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13 }}>{o.collecte_date}</td>
                  <td style={{ padding: '14px 12px' }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: '14px 12px' }}>
                    <select value={o.status} onChange={(e) => updateStatus(o.seq, e.target.value)} style={{ background: theme.inkCard, border: `1px solid ${theme.line}`, color: theme.cream, fontSize: 13, padding: '6px 10px', borderRadius: 4 }}>
                      {Object.keys(STATUS_META).map((k) => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export function TeamSidebar({ theme, active, router }) {
  const logout = () => { sessionStorage.removeItem('nqc-role'); router.push('/'); };
  return (
    <aside style={{ background: theme.inkSoft, borderRight: `1px solid ${theme.line}`, padding: '28px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 24px 28px', borderBottom: `1px solid ${theme.line}`, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>NQC</div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: theme.creamDim, textTransform: 'uppercase', marginTop: 2 }}>Espace équipe</div>
      </div>
      <div style={{ padding: '0 24px', flex: 1 }}>
        <div style={{ fontSize: 14, padding: '11px 12px', borderRadius: 4, background: theme.inkCard }}>
          {active === 'direction' && 'Tableau de bord'}
          {active === 'atelier' && 'Atelier — nettoyage'}
          {active === 'livreur' && 'Tournées livreur'}
        </div>
      </div>
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.line}` }}>
        <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${theme.line}`, color: theme.cream, padding: '8px 14px', borderRadius: 4, fontSize: 13, cursor: 'pointer', width: '100%' }}>Se déconnecter</button>
      </div>
    </aside>
  );
}

export function StatCard({ theme, label, value }) {
  return (
    <div style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 18 }}>
      <div style={{ fontSize: 12, color: theme.creamDim, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

export function Panel({ theme, title, children }) {
  return (
    <div style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{title}</div>{children}
    </div>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20, background: `${meta.color}22`, color: meta.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />{meta.label}
    </span>
  );
}
