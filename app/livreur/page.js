'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, fmt } from '../../lib/supabase';
import { TeamSidebar } from '../direction/page';

const DARK = {
  ink: '#1f1e1c', inkSoft: '#2a2826', inkCard: '#332f2b',
  cream: '#f5f1e8', creamDim: '#9b9588', gold: '#c9a876', line: 'rgba(245,241,232,0.10)',
  warn: '#d8a657', info: '#7aa9c9',
};

export default function LivreurPage() {
  const router = useRouter();
  const theme = DARK;
  const [orders, setOrders] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('nqc-role') !== 'livreur') router.push('/acces-equipe');
    else setAuthorized(true);
  }, [router]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').in('status', ['recu', 'pret']).order('seq', { ascending: true });
    setOrders(data || []);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchOrders();
    const channel = supabase.channel('orders-livreur').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authorized, fetchOrders]);

  if (!authorized || orders === null) {
    return <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  }

  const aRecuperer = orders.filter((o) => o.status === 'recu');
  const aLivrer = orders.filter((o) => o.status === 'pret');

  const updateStatus = async (seq, newStatus) => { await supabase.from('orders').update({ status: newStatus }).eq('seq', seq); };

  const encaisser = async (order) => {
    const amount = order.pay_mode === 'site' ? 0 : order.pay_split === '2' ? order.total / 2 : order.total;
    if (amount > 0) {
      const confirmed = window.confirm(`Confirmez l'encaissement de ${fmt(amount)} auprès de ${order.client} ?`);
      if (!confirmed) return;
    }
    await updateStatus(order.seq, 'livre');
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, display: 'grid', gridTemplateColumns: '220px 1fr' }}>
      <TeamSidebar theme={theme} active="livreur" router={router} />
      <main style={{ padding: '32px 40px', maxWidth: 640 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Vos tournées</h1>
        <p style={{ color: theme.creamDim, fontSize: 14, marginBottom: 32 }}>Collectes et livraisons à effectuer</p>

        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, color: theme.info }}>Collectes ({aRecuperer.length})</div>
        {aRecuperer.length === 0 && <div style={{ fontSize: 13, color: theme.creamDim, marginBottom: 24 }}>Aucune collecte à effectuer.</div>}
        {aRecuperer.map((o) => (
          <StopCard key={o.seq} order={o} theme={theme} type="pickup" onAction={() => updateStatus(o.seq, 'lavage')} actionLabel="Marquer comme récupéré" />
        ))}

        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, marginTop: 28, color: theme.warn }}>Livraisons ({aLivrer.length})</div>
        {aLivrer.length === 0 && <div style={{ fontSize: 13, color: theme.creamDim }}>Aucune livraison à effectuer.</div>}
        {aLivrer.map((o) => {
          const amount = o.pay_mode === 'site' ? 0 : o.pay_split === '2' ? o.total / 2 : o.total;
          return (
            <StopCard key={o.seq} order={o} theme={theme} type="deliver"
              cashNote={amount > 0 ? `À encaisser : ${fmt(amount)}` : 'Déjà payé — rien à encaisser'}
              onAction={() => encaisser(o)}
              actionLabel={amount > 0 ? `Encaisser ${fmt(amount)} et valider` : 'Marquer comme livré'} />
          );
        })}
      </main>
    </div>
  );
}

function StopCard({ order, theme, type, onAction, actionLabel, cashNote }) {
  const isPickup = type === 'pickup';
  const address = isPickup ? order.address : (order.return_mode === 'autre' ? order.other_address : order.return_mode === 'magasin' ? 'Retrait au magasin' : order.address);
  return (
    <div style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', background: isPickup ? `${theme.info}22` : `${theme.warn}22`, color: isPickup ? theme.info : theme.warn }}>{isPickup ? 'Collecte' : 'Livraison'}</span>
        <span style={{ fontSize: 12, color: theme.creamDim }}>{order.collecte_date}</span>
      </div>
      <div style={{ fontSize: 11, color: theme.creamDim, marginBottom: 4 }}>Commande {order.ref}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{order.client}</div>
      <div style={{ fontSize: 13, color: theme.creamDim, marginBottom: 10 }}>{address}</div>
      {cashNote && <div style={{ background: `${theme.warn}22`, color: theme.warn, fontSize: 12, fontWeight: 500, padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>{cashNote}</div>}
      <div style={{ fontSize: 13, color: theme.creamDim, marginBottom: 14 }}>{order.items.map((it, i) => <div key={i}>{it.qty} × {it.name}</div>)}</div>
      <button onClick={onAction} style={{ width: '100%', padding: 11, borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none', background: theme.gold, color: '#faf8f4', cursor: 'pointer' }}>{actionLabel}</button>
    </div>
  );
}
