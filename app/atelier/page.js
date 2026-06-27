'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { TeamSidebar, StatCard } from '../direction/page';

const DARK = {
  ink: '#1f1e1c', inkSoft: '#2a2826', inkCard: '#332f2b',
  cream: '#f5f1e8', creamDim: '#9b9588', gold: '#c9a876', line: 'rgba(245,241,232,0.10)',
  ok: '#7fae8a', wait: '#8a8579',
};

export default function AtelierPage() {
  const router = useRouter();
  const theme = DARK;
  const [orders, setOrders] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('nqc-role') !== 'atelier') router.push('/acces-equipe');
    else setAuthorized(true);
  }, [router]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').in('status', ['recu', 'lavage']).order('seq', { ascending: true });
    setOrders(data || []);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchOrders();
    const channel = supabase.channel('orders-atelier').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authorized, fetchOrders]);

  if (!authorized || orders === null) {
    return <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  }

  const recu = orders.filter((o) => o.status === 'recu');
  const lavage = orders.filter((o) => o.status === 'lavage');
  const updateStatus = async (seq, newStatus) => { await supabase.from('orders').update({ status: newStatus }).eq('seq', seq); };

  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream, display: 'grid', gridTemplateColumns: '220px 1fr' }}>
      <TeamSidebar theme={theme} active="atelier" router={router} />
      <main style={{ padding: '32px 40px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 8 }}>Atelier de nettoyage</h1>
        <p style={{ color: theme.creamDim, fontSize: 14, marginBottom: 32 }}>Suivez les pièces à laver et faites-les passer à l'étape suivante</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          <StatCard theme={theme} label="Commandes à démarrer" value={recu.length} />
          <StatCard theme={theme} label="Commandes en cours" value={lavage.length} />
          <StatCard theme={theme} label="Pièces aujourd'hui" value={orders.reduce((s, o) => s + o.items.reduce((a, it) => a + it.qty, 0), 0)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.wait }} /> À traiter</div>
            {recu.length === 0 && <div style={{ fontSize: 13, color: theme.creamDim, padding: '30px 0', textAlign: 'center', border: `1px dashed ${theme.line}`, borderRadius: 8 }}>Aucune commande en attente</div>}
            {recu.map((o) => (
              <JobCard key={o.seq} order={o} theme={theme} action={{ label: 'Démarrer le lavage', onClick: () => updateStatus(o.seq, 'lavage') }} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.ok }} /> En cours chez vous</div>
            {lavage.length === 0 && <div style={{ fontSize: 13, color: theme.creamDim, padding: '30px 0', textAlign: 'center', border: `1px dashed ${theme.line}`, borderRadius: 8 }}>Rien en cours actuellement</div>}
            {lavage.map((o) => (
              <JobCard key={o.seq} order={o} theme={theme} action={{ label: 'Marquer prêt à livrer', onClick: () => updateStatus(o.seq, 'pret') }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function JobCard({ order, theme, action }) {
  return (
    <div style={{ background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 16, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600 }}>{order.ref}</div>
        <div style={{ fontSize: 12, color: theme.creamDim }}>{order.collecte_date}</div>
      </div>
      <div style={{ fontSize: 13, color: theme.creamDim, marginBottom: 10 }}>{order.client}</div>
      <div style={{ fontSize: 13, marginBottom: 14 }}>{order.items.map((it, i) => <div key={i}>{it.qty} × {it.name}</div>)}</div>
      <button onClick={action.onClick} style={{ width: '100%', padding: 10, borderRadius: 5, fontSize: 13, fontWeight: 500, border: 'none', background: theme.gold, color: '#faf8f4', cursor: 'pointer' }}>{action.label}</button>
    </div>
  );
}
