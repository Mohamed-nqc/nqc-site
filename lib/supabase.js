import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const STATUS_META = {
  recu: { label: 'Reçu', color: '#8a8579' },
  lavage: { label: 'En lavage', color: '#7aa9c9' },
  pret: { label: 'Prêt à livrer', color: '#d8a657' },
  livre: { label: 'Livré', color: '#7fae8a' },
};

export const ROLES = {
  direction: { label: 'Direction', password: 'NQC-direction-2026', path: '/direction' },
  atelier: { label: 'Atelier', password: 'NQC-atelier-2026', path: '/atelier' },
  livreur: { label: 'Livreur', password: 'NQC-livreur-2026', path: '/livreur' },
};

export function fmt(v) {
  if (v === null || v === undefined) return null;
  return v.toFixed(2).replace('.', ',') + ' €';
}

export function orderLabel(seq) {
  if (seq < 100) return String(seq);
  return `100(${((seq - 100) % 99) + 1})`;
}

export function slugify(str) {
  return 'sc-' + str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
}

// Récupère le prochain numéro de commande et l'incrémente de façon atomique.
export async function getNextSeq() {
  const { data, error } = await supabase.rpc('increment_order_seq');
  if (error) {
    // Repli si la fonction RPC n'existe pas encore : lecture puis écriture simple.
    const { data: counter } = await supabase.from('order_counter').select('next_seq').eq('id', 1).single();
    const seq = counter ? counter.next_seq : 1;
    await supabase.from('order_counter').update({ next_seq: seq + 1 }).eq('id', 1);
    return seq;
  }
  return data;
}

export const PRICING = [
  { cat: 'vetements', label: 'Tous les vêtements', items: [
    { name: 'T-shirt / débardeur', lavage: 3.00, repassage: 1.50 },
    { name: 'Chemise', lavage: 9.00, repassage: 4.50, promo: 7.00 },
    { name: 'Chemisier / blouse', lavage: 8.00, repassage: 4.00 },
    { name: 'Pantalon', lavage: 10.00, repassage: 5.00 },
    { name: 'Jean', lavage: 12.00, repassage: 6.00 },
    { name: 'Short / bermuda', lavage: 6.00, repassage: 3.00 },
    { name: 'Jupe', lavage: 8.00, repassage: 4.00 },
    { name: 'Robe simple', lavage: 12.00, repassage: 6.00 },
    { name: 'Pull / gilet', lavage: 10.00, repassage: 5.00 },
    { name: 'Sweat / hoodie', lavage: 9.00, repassage: 4.50 },
    { name: 'Veste légère', lavage: 14.00, repassage: 7.00 },
    { name: 'Blazer / veste de costume', lavage: 18.00, repassage: 9.00 },
    { name: 'Costume complet', lavage: 50.00, repassage: 25.00 },
    { name: 'Smoking', lavage: 60.00, repassage: 30.00 },
    { name: 'Robe de soirée', lavage: 30.00, repassage: 15.00 },
    { name: 'Robe de mariée', lavage: 90.00, repassage: null },
    { name: 'Manteau', lavage: 30.00, repassage: 15.00 },
    { name: 'Doudoune', lavage: 24.00, repassage: null },
    { name: 'Jellaba', lavage: 16.00, repassage: 8.00 },
    { name: 'Caftan', lavage: 30.00, repassage: 15.00, promo: 22.00 },
    { name: 'Abaya', lavage: 14.00, repassage: 7.00 },
    { name: 'Qamis / thobe', lavage: 12.00, repassage: 6.00 },
    { name: 'Gandoura', lavage: 14.00, repassage: 7.00 },
    { name: 'Takchita (2 pièces)', lavage: 36.00, repassage: 18.00 },
  ]},
  { cat: 'domestique', label: 'Éléments domestiques', items: [
    { name: 'Couette 1 personne', lavage: 12.00, repassage: null },
    { name: 'Couette 2 personnes', lavage: 18.00, repassage: null },
    { name: 'Couverture / plaid', lavage: 8.00, repassage: null },
    { name: 'Rideaux (la paire)', lavage: 14.00, repassage: null },
    { name: 'Nappe', lavage: 7.00, repassage: 3.50 },
    { name: 'Drap housse + 2 taies', lavage: 10.00, repassage: 5.00 },
    { name: 'Serviette de bain (lot de 3)', lavage: 6.00, repassage: null },
    { name: 'Tapis (au m²)', lavage: 9.00, repassage: null },
    { name: 'Tapis de salon', lavage: 35.00, repassage: null },
  ]},
  { cat: 'accessoires', label: 'Accessoires', items: [
    { name: 'Cravate / noeud papillon', lavage: 5.00, repassage: 2.50 },
    { name: 'Écharpe / châle', lavage: 6.00, repassage: null },
    { name: 'Chapeau', lavage: 8.00, repassage: null },
    { name: 'Gants (la paire)', lavage: 4.00, repassage: null },
    { name: 'Sac à main (nettoyage)', lavage: 12.00, repassage: null },
  ]},
];
