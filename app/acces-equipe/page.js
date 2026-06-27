'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicNav } from '../components';
import { ROLES } from '../../lib/supabase';

const DARK = {
  ink: '#1f1e1c', inkSoft: '#2a2826', inkCard: '#332f2b',
  cream: '#f5f1e8', creamDim: '#9b9588', gold: '#c9a876', line: 'rgba(245,241,232,0.10)',
};

export default function AccesEquipePage() {
  const router = useRouter();
  const theme = DARK;
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const tryLogin = () => {
    if (!selected) return;
    if (password === ROLES[selected].password) {
      sessionStorage.setItem('nqc-role', selected);
      router.push(ROLES[selected].path);
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream }}>
      <PublicNav />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500 }}>Accès équipe</h1>
          <p style={{ color: theme.creamDim, fontSize: 14, marginTop: 8 }}>Sélectionnez votre espace pour vous connecter</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {Object.keys(ROLES).map((key) => (
            <div key={key} onClick={() => { setSelected(key); setError(false); setPassword(''); }}
              style={{ background: theme.inkSoft, border: `1px solid ${selected === key ? theme.gold : theme.line}`, borderRadius: 10, padding: '24px 20px', cursor: 'pointer' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{ROLES[key].label}</div>
              <div style={{ fontSize: 13, color: theme.creamDim }}>
                {key === 'direction' && "Vue d'ensemble de l'activité, chiffre d'affaires, commandes."}
                {key === 'atelier' && 'Pièces à laver et à repasser, classées par commande.'}
                {key === 'livreur' && 'Vos collectes et livraisons du jour, avec encaissement.'}
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <div style={{ marginTop: 24, background: theme.inkSoft, border: `1px solid ${theme.line}`, borderRadius: 10, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Connexion — {ROLES[selected].label}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && tryLogin()} placeholder="Mot de passe"
                style={{ flex: 1, background: theme.ink, border: `1px solid ${theme.line}`, color: theme.cream, padding: '12px 14px', borderRadius: 4, fontSize: 14 }} />
              <button onClick={tryLogin} style={{ background: theme.gold, color: '#faf8f4', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Se connecter</button>
            </div>
            {error && <div style={{ color: '#d88a8a', fontSize: 13, marginTop: 10 }}>Mot de passe incorrect. Réessayez.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
