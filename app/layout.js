export const metadata = {
  title: 'New Quality Cleaning — Pressing à Molenbeek-Saint-Jean',
  description: 'Pressing à domicile à Molenbeek-Saint-Jean. Collecte, nettoyage et livraison de vos vêtements, linge de maison et tenues traditionnelles.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>{children}</body>
    </html>
  );
}
