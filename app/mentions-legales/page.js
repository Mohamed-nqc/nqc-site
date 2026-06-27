import { PublicNav, SiteFooter, LIGHT } from '../components';

export default function MentionsLegalesPage() {
  const theme = LIGHT;
  return (
    <div style={{ minHeight: '100vh', background: theme.ink, color: theme.cream }}>
      <PublicNav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, marginBottom: 32 }}>Mentions légales</h1>

        <Section theme={theme} title="Éditeur du site">
          New Quality Cleaning<br />
          Bd Léopold II 78, 1080 Molenbeek-Saint-Jean, Belgique<br />
          Téléphone : +32 486 06 69 43<br />
          Email : contact@newqualitycleaning.be
        </Section>

        <Section theme={theme} title="Hébergement">
          Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
        </Section>

        <Section theme={theme} title="Collecte et traitement des données">
          Les informations recueillies lors d'une commande (nom, adresse, téléphone) sont utilisées uniquement pour le traitement de votre commande de pressing à domicile et ne sont jamais transmises à des tiers à des fins commerciales.
        </Section>

        <Section theme={theme} title="Propriété intellectuelle">
          L'ensemble des contenus présents sur ce site (textes, logo, mise en page) est la propriété de New Quality Cleaning, sauf mention contraire.
        </Section>

        <Section theme={theme} title="Responsabilité">
          New Quality Cleaning s'engage à apporter le plus grand soin au traitement de vos vêtements et articles de linge. En cas de dommage avéré lié à notre service, une indemnisation pourra être étudiée au cas par cas, conformément à la réglementation belge applicable aux pressings.
        </Section>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ theme, title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 14, color: theme.creamDim, lineHeight: 1.7 }}>{children}</p>
    </div>
  );
}
